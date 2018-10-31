using Owin;
using System;
using System.Configuration;
using System.Linq;
using System.Web;
//using OpenIdConnectMessage = Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectMessage;
using Microsoft.IdentityModel.Protocols;
using Microsoft.Owin.Security.OpenIdConnect;
using System.Security.Claims;
using Microsoft.Owin.Security.Notifications;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Identity.Client;
using System.Threading.Tasks;
using PowerBIApp.Model;
using PowerBIApp.Web.Common;
using System.Net;
using PowerBIApp.Web.Models.V3APIS;
using Microsoft.IdentityModel.Tokens;
//using PowerBIApp.Web.Models.V3APIS;

namespace PowerBIApp.Web
{
    public partial class Startup
    {
        private readonly VeracityApiHelper _veracityApiHelper = new VeracityApiHelper();

        // App config settings
        private static string _serviceId;// = ConfigurationManager.AppSettings["ServiceId"];
        public static readonly string ClientId = ConfigurationManager.AppSettings["ida:ClientId"];
        private static readonly string ClientSecret = ConfigurationManager.AppSettings["ida:ClientSecret"];

        private static readonly string AadInstance = ConfigurationManager.AppSettings["ida:AadInstance"];
        //public static string Tenant = ConfigurationManager.AppSettings["ida:Tenant"];
        private static readonly string TenantId = ConfigurationManager.AppSettings["ida:TenantId"];
        private static readonly string RedirectUri = ConfigurationManager.AppSettings["ida:RedirectUri"];
        public static bool AuthTicketAllowRefresh = bool.Parse(ConfigurationManager.AppSettings["ida:AuthTicketAllowRefresh"]);
        public static int AuthTicketExpiresInMinutes = int.Parse(ConfigurationManager.AppSettings["ida:AuthTicketExpiresInMinutes"]);
        //public static string ServiceUrl = ConfigurationManager.AppSettings["api:TaskServiceUrl"];

        // B2C policy identifiers
        private static readonly string SignUpSignInPolicyId = ConfigurationManager.AppSettings["ida:SignUpSignInPolicyId"];
        private static readonly string EditProfilePolicyId = ConfigurationManager.AppSettings["ida:EditProfilePolicyId"];
        private static readonly string ResetPasswordPolicyId = ConfigurationManager.AppSettings["ida:ResetPasswordPolicyId"];

        private static readonly string DefaultPolicy = SignUpSignInPolicyId;

        //// API Scopes
        //public static string ApiIdentifier = ConfigurationManager.AppSettings["api:ApiIdentifier"];
        //public static string ReadTasksScope = ApiIdentifier + ConfigurationManager.AppSettings["api:ReadScope"];
        //public static string WriteTasksScope = ApiIdentifier + ConfigurationManager.AppSettings["api:WriteScope"];
        //public static string[] Scopes = new string[]{ ReadTasksScope, WriteTasksScope };

        // OWIN auth middleware constants
        public const string ObjectIdElement = ClaimTypes.NameIdentifier;

        // Authorities
        public static string Authority = string.Format(AadInstance, TenantId, DefaultPolicy);

        //replace  ClaimTypes.NameIdentifier from meata data
        public static string UserNameIdentifier = ClaimTypes.NameIdentifier;

        //scope
        public static string Scopes = ConfigurationManager.AppSettings["api:scope"];

        //private static Func<TokenCacheBase> CacheFactoryFunc()
        //{
        //    return () => new DistributedTokenCache(HttpContext.Current.User as ClaimsPrincipal, DistributedCache, null, null);
        //}

        public void ConfigureAuth(IAppBuilder app)
        {
            //Veracity.Common.OAuth.Providers.TokenProvider.SetCacheFactoryMethod(CacheFactoryFunc());

            app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);

            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                CookieName = "a.c"
            });

            app.UseOpenIdConnectAuthentication(new OpenIdConnectAuthenticationOptions
            {
                // Generate the metadata address using the tenant and policy information
                MetadataAddress = Authority,

                // These are standard OpenID Connect parameters, with values pulled from web.config
                ClientId = ClientId,
                RedirectUri = RedirectUri,
                PostLogoutRedirectUri = RedirectUri,
                ClientSecret = ClientSecret,

                // Specify the callbacks for each type of notifications
                Notifications = new OpenIdConnectAuthenticationNotifications
                {
                    RedirectToIdentityProvider = OnRedirectToIdentityProvider,
                    AuthorizationCodeReceived = OnAuthorizationCodeReceived,
                    AuthenticationFailed = OnAuthenticationFailed
                },

                // Specify the claims to validate
                TokenValidationParameters = new TokenValidationParameters
                {
                    NameClaimType = "name"
                },

                // Specify the scope by appending all of the scopes requested into one string (separated by a blank space)
                //Scope = $"openid profile offline_access {ReadTasksScope} {WriteTasksScope}"
                Scope = $"{OpenIdConnectScopes.OpenId} offline_access {Scopes}"
            });
        }

        private Task OnRedirectToIdentityProvider(RedirectToIdentityProviderNotification<Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectMessage, OpenIdConnectAuthenticationOptions> notification)
        {
            var policy = notification.OwinContext.Get<string>("Policy");

            if (!string.IsNullOrEmpty(policy) && !policy.Equals(DefaultPolicy))
            {
                notification.ProtocolMessage.Scope = OpenIdConnectScopes.OpenId;
                notification.ProtocolMessage.ResponseType = OpenIdConnectResponseTypes.IdToken;
                notification.ProtocolMessage.IssuerAddress = notification.ProtocolMessage.IssuerAddress.ToLower().Replace(DefaultPolicy.ToLower(), policy.ToLower());
            }

            return Task.FromResult(0);
        }


        /*
         * Catch any failures received by the authentication middleware and handle appropriately
         */

        private Task OnAuthenticationFailed(AuthenticationFailedNotification<Microsoft.IdentityModel.Protocols.OpenIdConnect.OpenIdConnectMessage, OpenIdConnectAuthenticationOptions> notification)
        {
            notification.HandleResponse();

            // Handle the error code that Azure AD B2C throws when trying to reset a password from the login page 
            // because password reset is not supported by a "sign-up or sign-in policy"
            if (notification.ProtocolMessage.ErrorDescription != null &&
                notification.ProtocolMessage.ErrorDescription.Contains("AADB2C90118"))
            {
                // If the user clicked the reset password link, redirect to the reset password route
                notification.Response.Redirect("/Account/ResetPassword");
            }
            else if (notification.Exception.Message == "access_denied")
            {
                notification.Response.Redirect("/");
            }
            else
            {
                notification.Response.Redirect("/Home/Error?message=" + notification.Exception.Message);
            }

            return Task.FromResult(0);
        }


        /*
         * Callback function when an authorization code is received 
         */

        private async Task OnAuthorizationCodeReceived(AuthorizationCodeReceivedNotification notification)
        {
            notification.AuthenticationTicket.Properties.ExpiresUtc = DateTime.UtcNow.AddMinutes(AuthTicketExpiresInMinutes);
            notification.AuthenticationTicket.Properties.AllowRefresh = AuthTicketAllowRefresh;

            HttpContext.Current.User = new ClaimsPrincipal(notification.AuthenticationTicket.Identity);
            // Extract the code from the response notification
            var code = notification.Code;
            string signedInUserId = notification.AuthenticationTicket.Identity.FindFirst("userId").Value;

            //ClaimTypes.NameIdentifier).Value;

            TokenCache userTokenCache = new MSALSessionCache(signedInUserId, notification.OwinContext.Environment["System.Web.HttpContextBase"] as HttpContextBase).GetMsalCacheInstance(); //CacheFactoryFunc().Invoke();// 
            //TokenCache userTokenCache = new MSALSessionCache(signedInUserID, notification.OwinContext.Environment["System.Web.HttpContextBase"] as HttpContextBase).GetMsalCacheInstance();

            ConfidentialClientApplication context = new ConfidentialClientApplication(ClientId, Authority, RedirectUri, new ClientCredential(ClientSecret), userTokenCache, null);
            AuthenticationResult user = await context.AcquireTokenByAuthorizationCodeAsync(code, new[] { Scopes });
            //HttpContext.Current.GetOwinContext().Environment["System.Web.HttpContextBase"] = notification.OwinContext.Environment["System.Web.HttpContextBase"];


            //check policy
            string fullPatch = notification.AuthenticationTicket.Properties.RedirectUri;
            string tenantName = fullPatch.Split('/').Where(x => x.Length > 0).ToList()[2];
            Tenant tenant = _dbContext.Tenants.FirstOrDefault(x => x.DomainName.ToLower() == tenantName.ToLower());
            if (tenant == null)
            {
                return;
            }

            if (tenant.DomainName.ToLower() == "Admin".ToLower())
            {
                _serviceId = ConfigurationManager.AppSettings["ServiceId"];
            }
            else
            {
                TenantInfo tenantInfo = _dbContext.TenantInfos.FirstOrDefault(x => x.TenantId == tenant.Id && x.Key == "MyDNVGLServiceId");
                if (tenantInfo != null && !string.IsNullOrEmpty(tenantInfo.Value))
                {
                    _serviceId = tenantInfo.Value;
                }
            }

            if (string.IsNullOrEmpty(_serviceId))
                return;

            var policy = new Policy();
            try
            {
                policy = await _veracityApiHelper.GetPolicyModel(user.AccessToken, _serviceId);
            }
            catch
            {
                notification.OwinContext.Authentication.SignOut();
                return;
            }

            if ((HttpStatusCode)policy.statusCode == HttpStatusCode.NoContent)
            {
                //add local roles
                var ctx = HttpContext.Current.GetOwinContext();
                string myDnvglId = ctx.Authentication.User.Claims.FirstOrDefault(x => x.Type == "userId")?.Value;
                var tenantId = _dbContext.Tenants.FirstOrDefault(x => x.DomainName.ToLower() == tenantName.ToLower())?.Id;
                AppUser loginedUser = _dbContext.AppUsers.FirstOrDefault(u => u.MyDnvglUserId == myDnvglId && u.TenantId == tenantId);
                if (loginedUser == null)
                    return;
                var roles = _dbContext.AppUsers.FirstOrDefault(u => u.Id == loginedUser.Id && u.TenantId == loginedUser.TenantId)?.Roles.Select(r => r.RoleId).ToList();

                var claims = notification.AuthenticationTicket.Identity;
                foreach (var role in roles)
                {
                    claims.AddClaim(new Claim(ClaimTypes.Role, role));
                }

                //Replace claim's 'userId' from MyDnvglId to local UserID
                claims.RemoveClaim(claims.FindFirst(ClaimTypes.NameIdentifier));
                claims.AddClaim(new Claim(ClaimTypes.NameIdentifier, loginedUser.Id));

                //add access token into claims
                claims.AddClaim(new Claim("AccessToken",user.AccessToken));

                notification.OwinContext.Authentication.SignIn(new AuthenticationProperties { IsPersistent = true, ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(10) }, claims);
            }
            else
            {
                notification.OwinContext.Authentication.SignOut();
                string strRedirectUrl = policy.url;
                bool isHaveEmptyRedirectUrl =
                    strRedirectUrl.Split(new string[] { "?", "&" }, StringSplitOptions.None)
                        .Any(x => x.Equals("returnUrl="));
                if (isHaveEmptyRedirectUrl)
                    strRedirectUrl = strRedirectUrl.Replace("returnUrl=", "returnUrl=" + fullPatch);
                HttpContext.Current.Response.Redirect(strRedirectUrl);
            }

            //AppUser testUser = HttpContext.Current.GetOwinContext().GetUserManager<UserManager<AppUser>>().FindByName(notification.Request.User.GetPowerBIAppAuthenticationIdentity().GetUserName());

            //try
            //{
            //    //await ClientFactory.CreateClient(RedirectUri).My.ValidatePolicies();
            //    notification.OwinContext.Authentication.SignIn(notification.AuthenticationTicket.Identity);
            //}
            //catch (ServerException ex)
            //{
            //    //if (ex.Status == HttpStatusCode.NotAcceptable)
            //    //{
            //    //    notification.Response.Redirect(ex.GetErrorData<ValidationError>().Url); //Getting the redirect url from the error message.
            //    //    notification.HandleResponse(); //Mark the notification as handled to allow the redirect to happen.
            //    //}
            //}
        }
    }
}