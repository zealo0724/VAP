using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using AutoMapper;
using OfficeOpenXml;
using PowerBIApp.Data;
using PowerBIApp.Model;
using PowerBIApp.Web.Common;
using PowerBIApp.Web.Filters;
using Security = PowerBIApp.Common.Security.Roles;
using SecurityActions = PowerBIApp.Common.Security.Actions;

namespace PowerBIApp.Web.Controllers.WebApi
{
    [System.Web.Mvc.Route("{tenant}/webapi/admin/[controller]")]
    [ValidateModel]
    //[CustomAuthorize(Roles = Security.SYSTEM_ADMIN + "," + Security.USER_ADMIN + "," + Security.SUPER_TENANT_ADMIN)]
    public class UserAdminController : MultiTenantWebApiController
    {
        private IAdminRepository _adminRepo;
        private ITenantRepository _tenantRepo;
        private IVeracityApiHelperRepository _apiRepo;
        //private MyDnvGlApi _dnvGlApi;

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
            _adminRepo = new AdminRepository(PowerBiAppContext, Tenant);
            _tenantRepo = new TenantRepository(PowerBiAppContext);
            _apiRepo = new VeracityApiHelper();
            var claimsPrincipal = ((ClaimsPrincipal)User);
            //_dnvGlApi = new MyDnvGlApi(claimsPrincipal, Tenant);
        }

        [HttpGet]
        public async Task<IHttpActionResult>Users()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageUsers, async () =>
                {
            var users = _adminRepo.GetUsers();
            var result = Mapper.Map<IEnumerable<UserViewModel>>(users);
            
            return Json(result);
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> AddUser([FromBody]UserViewModel userModel)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageUsers, async () =>
            {
            //var testPolicy = new VeracityApiHelper().GetPolicyAsync("Get Current Service Id", "UserId");
                var resultBase = await _apiRepo.GrantUsersOnTenantAsync(HttpMethod.Put, ConfigurationManager.AppSettings["ServiceId"], userModel.MyDnvglUserId, false);
            var resultTenant = await _apiRepo.GrantUsersOnTenantAsync(HttpMethod.Put, Tenant.MyDnvGlServiceId, userModel.MyDnvglUserId, true);
            //var result = await WebApi.AddServiceSubscription(userId.ToString(), ConfigurationManager.AppSettings["ServiceId"], null);
            if (resultBase.IsSuccessCode && resultTenant.IsSuccessCode)
            {
                await _adminRepo.AddUser(userModel, false);
                return Ok();
            }

            return BadRequest(String.Join(",",resultBase.ErrorMessage ?? resultTenant.ErrorMessage));
            });
        }

    [HttpPost]
        public async Task<IHttpActionResult> PushUsers()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageUsers, async () =>
            {
            var errorMessage = new List<string>();
            var updUser = new List<UserViewModel>();

            if (!Request.Content.IsMimeMultipartContent())
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);

            var provider = new MultipartMemoryStreamProvider();

            await Request.Content.ReadAsMultipartAsync(provider);

            var file = provider.Contents.FirstOrDefault(x => x.Headers.ContentDisposition.Name == "\"file\"");

            if (file == null)
            {
                errorMessage.Add("Invalid file!");
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }

            var filename = file.Headers.ContentDisposition.FileName.Trim('\"').Split('\\').LastOrDefault();
            var stream = await file.ReadAsStreamAsync();

            string filePath = AppDomain.CurrentDomain.BaseDirectory + "templateFile\\";
            if (!Directory.Exists(filePath))
            {
                Directory.CreateDirectory(filePath);
            }

            string serverFilePath = filename;
            var outputStream = File.Create(filePath + serverFilePath);

            stream.Seek(0, SeekOrigin.Begin);
            stream.CopyTo(outputStream);
            stream.Close();
            stream.Dispose();
            outputStream.Close();
            outputStream.Dispose();
            System.IO.FileInfo myFile = new System.IO.FileInfo(AppDomain.CurrentDomain.BaseDirectory  + "templateFile\\" + serverFilePath);

            ExcelPackage package = new ExcelPackage(myFile);
            ExcelWorksheet worksheet = package.Workbook.Worksheets[1];
            int rowCount = worksheet.Dimension.Rows;
            int columnCount = worksheet.Dimension.Columns;
            //int rowIndexFirstName = 0, rowIndexLastName = 0, rowIndexMyDNVGLUserID = 0;
            int rowIndexEmail = 0;

            //string titleFirstName = ("FirstName").ToLower();
            //string titleLastName = "LastName".ToLower();
            string titleEmail = "Email".ToLower();
            //string titleMyDNVGLUserID = "MyDNVGLUserID".ToLower();

            for (int com = 1; com <= columnCount; com++)
            {
                string columnValue = worksheet.Cells[1, com].Value.ToString().Trim().ToLower();
                //if (titleFirstName == columnValue)
                //{
                //    rowIndexFirstName = com;
                //    continue;
                //}
                //if (titleLastName == columnValue)
                //{
                //    rowIndexLastName = com;
                //    continue;
                //}
                if (titleEmail == columnValue)
                {
                    rowIndexEmail = com;
                    continue;
                }
                //if (titleMyDNVGLUserID == columnValue)
                //{
                //    rowIndexMyDNVGLUserID = com;
                //    continue;
                //}
            }

            if (rowIndexEmail == 0)
            {
                errorMessage.Add("Unclear MyDNVGLUserID or Email Column, please check your file or download the template file from this page!");
            }

            if (errorMessage.Count > 0)
            {
                return Json(errorMessage);
            }

            //TODO: we'd better change to use UserViewModel.UserUpdList<updUsers> to bind the updUsers instead
            for (int row = 2; row <= rowCount; row++)
            {
                var m = new UserViewModel();
                var inputEmail = ValidExcelValue(worksheet.Cells[row, rowIndexEmail].Value);
               
                if (inputEmail == null)
                    continue;
                m.Email = inputEmail;
                var userList = await _apiRepo.GetUserModel(m.Email);
                var userView = Mapper.Map<List<UserViewModel>>(userList);
                if (userView.Any())
                {
                    var theUser = userView[0];
                    m.FirstName = theUser.FirstName;
                    m.LastName = theUser.LastName;
                    m.MyDnvglUserId = theUser.Id;
                }
                else
                {
                    m.Status = UserStatus.NOT_EXIST;
                }

                //m.MyDnvglUserId = ValidExcelValue(worksheet.Cells[row, rowIndexMyDNVGLUserID].Value);
                //m.FirstName = rowIndexFirstName == 0
                //    ? null
                //    : ValidExcelValue(worksheet.Cells[row, rowIndexFirstName].Value);
                //m.LastName = rowIndexLastName == 0
                //    ? null
                //    : ValidExcelValue(worksheet.Cells[row, rowIndexLastName].Value);

                updUser.Add(m);
            }

            File.Delete(filePath + serverFilePath);

            return Json(updUser);
            });
        }

        private string ValidExcelValue(object cellValue)
        {
            if (string.IsNullOrEmpty(cellValue?.ToString()))
                return null;
            return cellValue.ToString();
        }

        [HttpPost]
        public async Task<IHttpActionResult> BatchAddUsers([FromBody] UserBatchAddViewModel batchAddUsers)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageUsers, async () =>
                {
            var validUsers = batchAddUsers.Users.Where(x => x.MyDnvglUserId != null);
            List<string> errMessage = new List<string>();
            foreach (var userModel in validUsers)
            {
                var resultBase = await _apiRepo.GrantUsersOnTenantAsync(HttpMethod.Put, ConfigurationManager.AppSettings["ServiceId"], userModel.MyDnvglUserId, false);
                var resultTenant = await _apiRepo.GrantUsersOnTenantAsync(HttpMethod.Put, Tenant.MyDnvGlServiceId, userModel.MyDnvglUserId, true);
                if (resultBase.IsSuccessCode && resultTenant.IsSuccessCode)
                {
                    userModel.Roles = batchAddUsers.Roles;
                    userModel.EntityTrees = batchAddUsers.EntityTrees;
                    await _adminRepo.AddUser(userModel, false);
                }
                else
                {
                    errMessage.Add("error: " + userModel.Email + ": " + String.Join(",", resultBase.ErrorMessage ?? resultTenant.ErrorMessage));
                }
            }
            //TODO : return error messages to frontend
            return Json(true);
            });
        }

        [HttpPut]
        public async Task<IHttpActionResult> UpdateUser([FromBody] UserViewModel userModel)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageUsers, async () =>
            {
            await _adminRepo.UpdateUser(userModel);
            return Ok();
        });
        }

    [HttpDelete]
        public async Task<IHttpActionResult> DeleteUser([FromBody] UserViewModel userModel)
        {
    return await HttpActionResultWithErrorHandling(SecurityActions.ManageUsers, async () =>
    {
            //var isExist = await _dnvGlApi.GetUsersById(userModel.MyDnvglUserId);//When delete a not exist user in api, will return same success value, so removed this judge.

            var result = await _apiRepo.GrantUsersOnTenantAsync(HttpMethod.Delete, Tenant.MyDnvGlServiceId, userModel.MyDnvglUserId, false);
            //var result = await WebApi.AddServiceSubscription(userId.ToString(), ConfigurationManager.AppSettings["ServiceId"], null);
            if (result.IsSuccessCode || result.HttpStatusCode == HttpStatusCode.NotFound)
            {
                await _adminRepo.DeleteUser(userModel);
                return Ok();
            }
            return BadRequest(string.Join(",", result.ErrorMessage));
});
        }

[HttpGet]
        public async Task<IHttpActionResult> GetDnvglUser([FromUri]string email, int start = 0, int length = 10, /*string search = "", */string sort = "")
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageUsers, async () =>
                {
            var user = await _apiRepo.GetUserModel(email);
            var userView = Mapper.Map<List<UserViewModel>>(user);
            return Json(userView);
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult>Roles()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageUsers, async () => Ok(Security.TENANT_ROLES));
        }
    }
}
