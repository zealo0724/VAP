using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using AutoMapper;
using Microsoft.PowerBI.Api.V1;
using Microsoft.PowerBI.Api.V1.Models;
using Microsoft.Rest;
using PowerBIApp.Data;
using PowerBIApp.Model.ViewModel;
using PowerBIApp.Services.PowerBiService;
using PowerBIApp.Web.Filters;
using Report = PowerBIApp.Model.Report;
using SecurityActions = PowerBIApp.Common.Security.Actions;
using PowerBIApp.Services.PowerBIPremium;

namespace PowerBIApp.Web.Controllers.WebApi
{
    [RoutePrefix("{tenant}/webapi/admin/[controller]")]
    [ValidateModel]
    //[CustomAuthorize(Roles = Security.SYSTEM_ADMIN + "," + Security.SUPER_TENANT_ADMIN + "," + Security.REPORT_ADMIN + "," + Security.DATA_ADMIN)]
    public class ReportAdminController : MultiTenantWebApiController
    {
        private IAdminRepository _adminRepo;
        private PowerBiService _powerBiService;
        private PowerBIPremium _powerBiPremium;
        private static string ReportLocation { get; set; }
        private static string WorkspaceCollectionName => ConfigurationManager.AppSettings["powerbi:WorkspaceCollection_" + ReportLocation];
        private static string AccessKey => ConfigurationManager.AppSettings["powerbi:AccessKey_" + ReportLocation];
        private static string ApiUrl => ConfigurationManager.AppSettings["powerbi:ApiUrl"];

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
            _adminRepo = new AdminRepository(PowerBiAppContext, Tenant);
            _powerBiService = new PowerBiService(Tenant.Id, Tenant.PowerBiWorkspaceId, Tenant.ReportLocation);
            _powerBiPremium = new PowerBIPremium(Tenant);
            ReportLocation = Tenant.ReportLocation;
        }

        [HttpGet]
        //[CustomAuthorize(Roles = Security.SYSTEM_ADMIN)]
        public async Task<IHttpActionResult> CapacityInfo()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
                {
            var capacityInfo = await _powerBiPremium.GetCapacityInfo();
            return Json(capacityInfo);
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult> Reports()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
                {
            var data = _adminRepo.GetReports().OrderBy(x=>x.Title);
            var result = Mapper.Map<IEnumerable<ReportAdminModel>>(data).ToList();
            var varEntityTypeProperties = _adminRepo.GetEntityTypeProperties();
            foreach (var i in result)
            {
                var v = varEntityTypeProperties.FirstOrDefault(k => k.Id == i.EntityTypePropertyId);
                i.EntityTypeProperty = (v == null ? string.Empty : v.Name);
            }
            return Json(result);
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult>CheckFileInuse(string PBIReportId)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
            {
            var reports = _adminRepo.GetReports().Where(a => a.PowerBiReportId == PBIReportId);
            if (reports.Any())
            {
                return Json(true);
            }
            else
            {
                return Json(false);
            }
            });
        }

    [HttpGet]
        public async Task<IHttpActionResult>CheckReportConnectInuse(int ReportConnectId)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
                {
            var reports = _adminRepo.GetEntities().Where(a => a.Reports.Any( r=>r.Id == ReportConnectId));
            if (reports.Any())
            {
                return Json(true);
            }
            else
            {
                return Json(false);
            }
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult>GetEntityTypeProperties()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
                {
            var data = _adminRepo.GetEntityTypeProperties();
            return Json(data);
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult>PowerBiReports()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
                {
            var data = _adminRepo.GetPowerBiReports();
            var result = Mapper.Map<IEnumerable<PowerBiReportAdminModel>>(data);
            return Json(result);
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> AddReport([FromBody] ReportAdminModel report)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
            {
            var isPremiumReport = await _powerBiPremium.ValidReportId(report.PowerBiReportId);
            var varReport = new Report
            {
                TenantId = Tenant.Id,
                MenuName = report.MenuName,
                Title = report.Title,
                Description = report.Description,
                PowerBiReportId = report.PowerBiReportId,
                IsShown = report.IsShown,
                EntityFilter = report.EntityFilter,
                EntityTypePropertyId = report.EntityTypePropertyId,
                IsPremiumReport = isPremiumReport,
                ShowPageName = report.ShowPageName,
                ShowReportName = report.ShowReportName,
                ShowEntityName = report.ShowEntityName
            };

            _adminRepo.AddReport(varReport);
            await _adminRepo.SaveAllAsync();

            //var mapped = Mapper.Map<Report>(report);
            //mapped.TenantId = Tenant.Id;
            //_adminRepo.AddReport(mapped);
            //await _adminRepo.SaveAllAsync();

            return Json(true);
        });
        }

    [HttpPost]
        public async Task<IHttpActionResult> UpdateReport([FromBody]ReportAdminModel updatedReport)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
                {

                    //TODO: Update and save!
                var isPremiumReport = await _powerBiPremium.ValidReportId(updatedReport.PowerBiReportId);
                updatedReport.IsPremiumReport = isPremiumReport;
            var varReport = Mapper.Map<Report>(updatedReport);
            _adminRepo.UpdateReport(varReport);

            return Json(true);
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> DeleteReport([FromBody]ReportAdminModel report)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
            {
            var result = report.Id != null && await _adminRepo.DeleteReport((int)report.Id);
            return Json(result);
            });
        }

    [HttpPost]
        public async Task<IHttpActionResult> AddPowerBiReport([FromUri] string reportName = null,
            [FromUri] string connectionstring = null, [FromUri] bool isPagesHidden = false)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
                {
            if (!Request.Content.IsMimeMultipartContent())
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);

            var provider = new MultipartMemoryStreamProvider();

            await Request.Content.ReadAsMultipartAsync(provider);

            var file = provider.Contents.FirstOrDefault();
            if (file == null)
            {
                throw new HttpResponseException(HttpStatusCode.BadRequest);
            }

            try
            {
                var filename = reportName ?? file.Headers.ContentDisposition.FileName.Trim('\"');
                var stream = await file.ReadAsStreamAsync();
                //var powerBiReportOld = await _powerBiService.ImportPbix(filename, stream);
                var powerBiReport = await _powerBiPremium.ImportPbix(filename, isPagesHidden, stream);
                var datasetId = powerBiReport.Item2.Datasets[0].Id;
                powerBiReport.Item1.Externaldata = !string.IsNullOrEmpty(connectionstring);
                if (!string.IsNullOrEmpty(connectionstring))
                {
                    try
                    {
                        await _powerBiPremium.UpdateConnection(datasetId, connectionstring);
                    }
                    catch
                    {

                        //return BadRequest("Message Message Message Message!");;
                        //HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, "The Custom connection is not avaliable.");
                        //HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.SeeOther)//303
                        //{
                        //    Content = new StringContent("Custom connection is unavaliable")
                        //};
                        return Json(new {isSuccessfull = false, message = "Custom connection is unavaliable"});
                    }
                }

                _adminRepo.AddPowerBiReport(powerBiReport.Item1);
                await _adminRepo.SaveAllAsync();

                //return Ok(powerBiReport);
                //HttpResponseMessage responseOk = new HttpResponseMessage(HttpStatusCode.OK);
                return Json(new {isSuccessfull = true});
            }
            catch (Exception ex)
            {
                return Json(new {isSuccessfull = false, message = "Error uploading report!"});
            }
            });
        }

        [HttpDelete]
        public async Task<IHttpActionResult> DeletePowerBiReportDeprecated([FromBody] string datasetId)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
            {
            await _powerBiService.DeleteDataset(datasetId);
            _adminRepo.DeletePowerBiReport(datasetId);
            return Json(datasetId);
        });
        }

        [HttpDelete]
        public async Task<IHttpActionResult> DeletePowerBiReportPremium([FromBody] string datasetId)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
                {
            await _powerBiPremium.DeleteDataset(datasetId);
            _adminRepo.DeletePowerBiReport(datasetId);
            return Json(datasetId);
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult> GetLocation() {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
            {
            return Json(ReportLocation);
        });
        }

    }
}

