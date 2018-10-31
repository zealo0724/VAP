using Microsoft.Identity.Client;
using Microsoft.Owin.Security.Cookies;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using VerIT.MyDNV.Api.Gateway.ClientModel;
using VerIT.MyDNV.Api.Gateway.ClientModel.Extensions;
using VerIT.MyDNV.Api.Gateway.ClientModel.Models;

namespace PowerBIApp.Web.Common
{
    public class TokenProvider : IOAuthTokenProvider
    {
        public string GetUserAccessToken() => GetBearerToken();

        protected override string GetBearerToken()
        {
            string accessToken = (HttpContext.Current.User.Identity as ClaimsIdentity)?.FindFirst("AccessToken").Value;
            if (!string.IsNullOrEmpty(accessToken))
            {
                return accessToken;
            }

            var signedInUserId = (HttpContext.Current.User.Identity as ClaimsIdentity)?.FindFirst("userId").Value;
            var cache = new MSALSessionCache(signedInUserId, HttpContext.Current.GetOwinContext().Environment["System.Web.HttpContextBase"] as HttpContextBase).GetMsalCacheInstance();
            var clientCred = new ClientCredential(ConfigurationManager.AppSettings["ida:ClientSecret"]);
            var context = new ConfidentialClientApplication(Startup.ClientId, Startup.Authority, ConfigurationManager.AppSettings["ida:RedirectUri"], clientCred, cache, null);
            var user = context.Users.FirstOrDefault();
            if (user == null)
            {//Clear cookies and notify error handler that cache is corrupted
                HttpContext.Current.GetOwinContext().Authentication.SignOut(CookieAuthenticationDefaults.AuthenticationType);
                throw new ServerException(new ErrorDetail
                {
                    Message = "Invalid token cache"
                }, HttpStatusCode.Unauthorized);
            }
            var token = Task.Run(async () => await context.AcquireTokenSilentAsync(new[] { ConfigurationManager.AppSettings["api:scope"] }, user, Startup.Authority, false)).Result;
            return token.AccessToken;
        }
    }
}