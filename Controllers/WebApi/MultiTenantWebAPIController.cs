using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Results;
using PowerBIApp.Data;
using PowerBIApp.Model;

// ReSharper disable once CheckNamespace
namespace PowerBIApp.Web.Controllers
{
    public class MultiTenantWebApiController : ApiController
    {
        private readonly ITenantRepository _tenantRepo;
        private string _currentPath;
        protected readonly PowerBIAppContext PowerBiAppContext;

        public MultiTenantWebApiController()
        {
            PowerBiAppContext = new PowerBIAppContext();
            _tenantRepo = new TenantRepository(PowerBiAppContext);
        }

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
            _currentPath = Request.RequestUri.AbsolutePath;
            var currentTenant = _tenantRepo.GetByPath(_currentPath);
            Tenant = currentTenant;
            if (currentTenant == null)
            {
                throw new ArgumentException("Error");
            }
        }

        protected Tenant Tenant { get; private set; }

        protected string MyDnvGlUserId
        {
            get
            {
                //((ClaimsPrincipal)User).Claims.LastOrDefault(c => c.Type.Contains("nameidentifier"));
                return ((ClaimsPrincipal)User).Claims?.FirstOrDefault(c => c.Type == "userId")?.Value ?? string.Empty;
            }
        }
        protected string UserId
        {
            get
            {
                return PowerBiAppContext.AppUsers.FirstOrDefault(u =>
                    u.MyDnvglUserId == MyDnvGlUserId && u.TenantId == Tenant.Id)?.Id;
            }
        }

        public async Task<IHttpActionResult> HttpActionResultWithErrorHandling(
            List<string> authRolesNeeded, 
            Func<Task<IHttpActionResult>> action)
        {
            var authRepo = new AuthorizationRepository(PowerBiAppContext, Tenant, MyDnvGlUserId);
            var authResult = authRepo.ValidRole(authRolesNeeded);
            if (authResult.HttpStatusCode != HttpStatusCode.OK)
            {
                return new ResponseMessageResult(Request.CreateResponse(authResult.HttpStatusCode, authResult.Message));
            }

            return await action();
        }
    }
}