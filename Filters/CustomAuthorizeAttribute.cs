using System;
using System.Diagnostics;
using System.Web;
using System.Web.Mvc;

namespace PowerBIApp.Web.Filters
{
    /*
    public class CustomAuthorizeAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            Debug.WriteLine("Inside CustomAuth:AuthCore");
            var isAuthorized = base.AuthorizeCore(httpContext);
            if (!isAuthorized)
            {
                return false;
            }

            string username = httpContext.User.Identity.Name;

            //UserRepository repo = new UserRepository();
            //return repo.IsUserInRole(username, this.Roles);

            var roleCount = this.Roles.Split(',').Length;
            return roleCount > 0;

        }
    }
    */
}