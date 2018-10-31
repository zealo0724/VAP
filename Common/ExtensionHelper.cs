using System;
using System.Collections.Generic;
using System.Globalization;
using System.IdentityModel.Services;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Security.Principal;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using PowerBIApp.Common;
using PowerBIApp.Data;
using PowerBIApp.Model;
//using PowerBIApp.Resource.PowerBIApp.Web.Comment;
using PowerBIApp.Services;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Newtonsoft.Json;
using CB.Ioc;
using AuthorizationContext = System.Security.Claims.AuthorizationContext;

namespace PowerBIApp.Web.Common
{
    public static class ExtensionHelper
    {
        public const string USER_FULL_NAME_COOKIE_KEY = "UserFullNameCookie";

        public static CB.Ioc.IScopeResolver FContainer;
        private static readonly string _ServerRootPath;

        static ExtensionHelper()
        {
            _ServerRootPath = AppDomain.CurrentDomain.BaseDirectory;
        }

        public static string ResolveFilePath(this Microsoft.Owin.IOwinContext context, string path)
        {
            if (path.StartsWith("~"))
            {
                path = path.Substring(1);
            }
            if (path.StartsWith("/"))
            {
                path = path.Substring(1);
            }
            return Path.Combine(_ServerRootPath, path);
        }

        public static CultureInfo CurrentGlobalFormat()
        {
            return (CultureInfo)CultureInfo.CurrentUICulture.Clone();
        }

        public static IHtmlString Json(this HtmlHelper htmlHelper, object obj)
        {
            return htmlHelper.Raw(JsonConvert.SerializeObject(obj));
        }

        public static bool CheckAccess(this IPrincipal principal, string resource, string action)
        {
            var p = (ClaimsPrincipal)principal;
            if (p == null)
            {
                throw new ArgumentException("The value is not a ClaimsPrincipal", "principal");
            }
            var authContext = new AuthorizationContext(p, resource, action);
            return FederatedAuthentication.FederationConfiguration.IdentityConfiguration.ClaimsAuthorizationManager.CheckAccess(authContext);
        }

        public static AppUser CurrentUser()
        {
            if (FContainer.CanResolve<AppUser>())
            {
                return FContainer.Resolve<AppUser>();
            }
            return null;
        }

        public static string UserFriendlyName(this IPrincipal principal)
        {
            var cookie = HttpContext.Current.GetOwinContext().Request.Cookies[USER_FULL_NAME_COOKIE_KEY];
            if (string.IsNullOrEmpty(cookie))
            {
                var user = CurrentUser();
                if (user != null && user.MyDnvglUserId != null)
                {
                    cookie = $"{user.FirstName}|{user.LastName}";
                }
            }
            if (!string.IsNullOrEmpty(cookie))
            {
                var sp = cookie.Split('|');
                if (sp.Length == 2)
                {
                    return $"{sp[1]}, {sp[0]}";
                }
                return cookie;
            }
            return string.Empty;
        }

        public static string Content(this UrlHelper url, string resUrl, HttpServerUtilityBase server)
        {
#if DEBUG

#else
            resUrl = resUrl.ToLower();
            var ext = Path.GetExtension(resUrl);
            var minExt = string.Format(".min{0}", ext);
            if (!resUrl.EndsWith(minExt))
            {
                var minjsFilePath = resUrl.Remove(resUrl.Length - ext.Length) + minExt;
                if (File.Exists(server.MapPath(minjsFilePath)))
                {
                    resUrl = minjsFilePath;
                }
            }
#endif
            return url.Content(resUrl);
        }

        public static void DisposeOWinResource(this IOwinContext context)
        {
            if (InstanceControlConstant.ONE_DB_CONTEXT_PER_REQUEST)
            {
                context.Get<PowerBIAppContext>().Dispose();
            }
            if (InstanceControlConstant.ONE_USER_MANAGER_PER_REQUEST)
            {
                context.GetUserManager<UserManager<AppUser>>().Dispose();
            }
        }

        /* private static KeyValuePair<CommentSections, Tuple<string, string>>[] _CACHED_ORDERED_COMMENT_SECTIONS;

         public static KeyValuePair<CommentSections, Tuple<string, string>>[] GetSectionsByOrder()
         {
             return _CACHED_ORDERED_COMMENT_SECTIONS ?? (_CACHED_ORDERED_COMMENT_SECTIONS = Helper.GetEnumWithNameByOrder<CommentSections>(CommentSectionsRes.ResourceManager).ToArray());
         }
         */
        public static void ResposeUnauthorized(this IOwinContext context)
        {
            var fileName = context.ResolveFilePath("~/Unauthorized.html");
            var unauthorizedContent = string.Empty;
            if (File.Exists(fileName))
            {
                try
                {
                    using (var f = new StreamReader(fileName))
                    {
                        unauthorizedContent = f.ReadToEnd();
                    }
                }
                catch (IOException)
                {

                }
            }
            if (string.IsNullOrEmpty(unauthorizedContent))
            {
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            }
            else
            {
                context.Response.Write(unauthorizedContent);
            }
        }
    }
}