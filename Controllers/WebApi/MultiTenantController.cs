using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using Microsoft.Owin.Security;
using PowerBIApp.Data;
using PowerBIApp.Model;

// ReSharper disable once CheckNamespace
namespace PowerBIApp.Web.Controllers
{
    [Authorize]
    public class MultiTenantController : Controller
    {
        private readonly ITenantRepository _tenantRepo;
        protected readonly PowerBIAppContext PowerBiAppContext;
        private string _currentPath;

        public MultiTenantController()
        {
            PowerBiAppContext = new PowerBIAppContext();
            _tenantRepo = new TenantRepository(PowerBiAppContext);
        }

        protected override void Initialize(System.Web.Routing.RequestContext requestContext)
        {

            base.Initialize(requestContext);
            _currentPath = Request.RawUrl;
            if (_currentPath.ToLower().StartsWith("/home/logout"))
            {
                Logout();
                return;
            }

            var currentTenant = _tenantRepo.GetByPath(_currentPath);
            Tenant = currentTenant;
            if (currentTenant == null)
            {
                Redirect("Error");
                //throw new ArgumentException("Error");
            }
        }

        private void Logout()
        {
            // To sign out the user, you should issue an OpenIDConnect sign out request.
            if (Request.IsAuthenticated)
            {
                IEnumerable<AuthenticationDescription> authTypes = HttpContext.GetOwinContext().Authentication.GetAuthenticationTypes();
                HttpContext.GetOwinContext().Authentication.SignOut(authTypes.Select(t => t.AuthenticationType).ToArray());
                Request.GetOwinContext().Authentication.GetAuthenticationTypes();
            }

            //if (HttpContext.Current != null)
            //{
            //    int cookieCount = HttpContext.Current.Request.Cookies.Count;
            //    for (var i = 0; i < cookieCount; i++)
            //    {
            //        var cookie = HttpContext.Current.Request.Cookies[i];
            //        if (cookie != null)
            //        {
            //            var cookieName = cookie.Name;
            //            var expiredCookie = new HttpCookie(cookieName) { Expires = DateTime.Now.AddDays(-1) };
            //            HttpContext.Current.Response.Cookies.Add(expiredCookie); // overwrite it
            //        }
            //    }

            //    // clear cookies server side
            //    HttpContext.Current.Request.Cookies.Clear();
            //}

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
                if (Tenant == null) return string.Empty;

                return PowerBiAppContext.AppUsers.FirstOrDefault(u =>
                    u.MyDnvglUserId == MyDnvGlUserId && u.TenantId == Tenant.Id)?.Id;
            }
        }

    }
}