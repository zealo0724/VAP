using System;
using System.Collections.Generic;
using System.IdentityModel.Services;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using Microsoft.Owin.Security;
using PowerBIApp.Services.PowerBiService;

namespace PowerBIApp.Web.Controllers
{
    public class HomeController : MultiTenantController
    {
        //private string ADFS_IssuerName = "http://fsext1test.dnv.com/adfs/services/trust"; //TODO: Get from ConfigurationManager.AppSettings["ADFS_IssuerName"];
        public ActionResult Index()
        {
            if (string.IsNullOrWhiteSpace(MyDnvGlUserId))
            {
                return View("UnAuthorize");
            }

            //Check role to find if the user is exist in Framework or not
            if(string.IsNullOrEmpty(UserId))
            {
                return View("UnAuthorize");
            }

            if (Tenant == null)
            {
                return View("NoTenant");
            }
            ViewBag.TenantName = Tenant.Name;
            //ViewData["TenantName"] = Tenant.Name;
            return View();
        }

        public ActionResult Logout()
        {
            // To sign out the user, you should issue an OpenIDConnect sign out request.
            if (Request.IsAuthenticated)
            {
                IEnumerable<AuthenticationDescription> authTypes = HttpContext.GetOwinContext().Authentication.GetAuthenticationTypes();
                HttpContext.GetOwinContext().Authentication.SignOut(authTypes.Select(t => t.AuthenticationType).ToArray());
                Request.GetOwinContext().Authentication.GetAuthenticationTypes();
            }

            //var module = FederatedAuthentication.WSFederationAuthenticationModule;
            //if (module != null)
            //{
            //    var signoutURl = new Uri(WSFederationAuthenticationModule.GetFederationPassiveSignOutUrl(module.Issuer, null, null));
            //    WSFederationAuthenticationModule.FederatedSignOut(signoutURl, null);
            //}

            return View("UnAuthorize");
        }

        public ActionResult Error()
        {
            return View();
        }
    }
}
