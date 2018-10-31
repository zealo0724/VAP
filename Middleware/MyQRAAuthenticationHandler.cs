//using System;
//using System.Diagnostics;
//using System.IO;
//using System.Linq;
//using System.Net;
//using System.Threading.Tasks;
//using CB.Ioc;
//using PowerBIApp.Common.Services.Security;
//using PowerBIApp.Model;
//using PowerBIApp.Services;
//using PowerBIApp.Web.Common;
//using Microsoft.AspNet.Identity;
//using Microsoft.AspNet.Identity.EntityFramework;
//using Microsoft.Owin.Security;
//using Microsoft.Owin.Security.Infrastructure;
//using PowerBIApp.Data;

//namespace PowerBIApp.Web.Middleware
//{
//    public class PowerBIAppAuthenticationHandler: AuthenticationHandler<PowerBIAppAuthenticationOptions>
//    {
//        private readonly IScopeResolver _Container;

//        public PowerBIAppAuthenticationHandler(IScopeResolver container)
//        {
//            _Container = container;
//        }

//        #region Overrides of AuthenticationHandler

//        /// <summary>
//        /// Called once by common code after initialization. If an authentication middleware responds directly to
//        ///             specifically known paths it must override this virtual, compare the request path to it's known paths, 
//        ///             provide any response information as appropriate, and true to stop further processing.
//        /// </summary>
//        /// <returns>
//        /// Returning false will cause the common code to call the next middleware in line. Returning true will
//        ///             cause the common code to begin the async completion journey without calling the rest of the middleware
//        ///             pipeline.
//        /// </returns>
//        //public override async Task<bool> InvokeAsync()
//        //{
//        //    //ToDo Check must have windows identity or MyDNV Claim
//        //    //because when we store it in cookie, and next time, user will get it directly and windows authentication won't be called
//        //    //if no MYQRA_AUTHENTICATION_TYPE
//        //    if (Context.Authentication.User.Identities.All(i => i.AuthenticationType != LoginProvidersConstant.MYQRA_AUTHENTICATION_TYPE))
//        //    {
//        //        var ticket = await AuthenticateAsync();
//        //        if (ticket != null)
//        //        {
//        //            Context.Authentication.SignIn(ticket.Properties, ticket.Identity);
//        //        }
//        //        else
//        //        {
//        //            Context.ResposeUnauthorized();
//        //            //stop because can't validate the user in PowerBIApp database, so stop
//        //            return true;
//        //        }
//        //    }
//        //    else if (Context.Authentication.User.Identities.All(i => i.AuthenticationType == LoginProvidersConstant.MYQRA_AUTHENTICATION_TYPE))
//        //    {
//        //        ////if only have MYQRA_AUTHENTICATION_TYPE, then mean the coolie is still valid, so the authentication get it directly, and windows / ADFS won't be called
//        //        ////so we have to force user logout of the MYQRA_AUTHENTICATION_TYPE and force them to refresh
//        //        //var ecoassistantUrl = Settings.Default.FuelCalculatorPath;
//        //        //if (ecoassistantUrl.StartsWith("~"))
//        //        //{
//        //        //    ecoassistantUrl = ecoassistantUrl.Substring(1);
//        //        //}
//        //        //if (!ecoassistantUrl.StartsWith("/"))
//        //        //{
//        //        //    ecoassistantUrl = "/" + ecoassistantUrl;
//        //        //}
//        //        //if (Context.Request.Uri.PathAndQuery.StartsWith(ecoassistantUrl))
//        //        //{
//        //        //    return false;
//        //        //}
//        //        Context.Authentication.SignOut(LoginProvidersConstant.MYQRA_AUTHENTICATION_TYPE);
//        //        Context.Response.Redirect(Context.Request.Path.ToString());
//        //    }
//        //    return false;
//        //}

//        /// <summary>
//        /// Override this method to dela with 401 challenge concerns, if an authentication scheme in question
//        ///             deals an authentication interaction as part of it's request flow. (like adding a response header, or
//        ///             changing the 401 result to 302 of a login page or external sign-in location.)
//        /// </summary>
//        /// <returns/>
//        //protected async override Task ApplyResponseChallengeAsync()
//        //{
//        //    await base.ApplyResponseChallengeAsync();
//        //}

//        /// <summary>
//        /// Override this method to dela with sign-in/sign-out concerns, if an authentication scheme in question
//        ///             deals with grant/revoke as part of it's request flow. (like setting/deleting cookies)
//        /// </summary>
//        /// <returns/>
//        //protected async override Task ApplyResponseGrantAsync()
//        //{
//        //    await base.ApplyResponseGrantAsync();
//        //}

//        /// <summary>
//        /// The core authentication logic which must be provided by the handler. Will be invoked at most
//        ///             once per request. Do not call directly, call the wrapping Authenticate method instead.
//        /// </summary>
//        /// <returns>
//        /// The ticket data provided by the authentication logic
//        /// </returns>
//        //protected async override Task<AuthenticationTicket> AuthenticateCoreAsync()
//        //{
//        //    AuthenticationTicket ticket = null;

//        //    var um = _Container.Resolve<UserManager<AppUser>>();
//        //    try
//        //    {
//        //        //var tenantId = 2;
//        //        //PowerBIAppContext context = new PowerBIAppContext();
//        //        //var adminRepo = new AdminRepository(context,tenantId);
//        //        var userClaimsPrincipal = Context.Authentication.User;
//        //        var userLoginProviderKeyClaim =
//        //            userClaimsPrincipal.Claims.SingleOrDefault(c => c.Type.EndsWith("claims/nameidentifier"));
//        //        //can't find MyDNVGL id, try to find MyDNVGL long id
//        //        if (userLoginProviderKeyClaim == null)
//        //        {
//        //            userLoginProviderKeyClaim =
//        //                userClaimsPrincipal.Claims.SingleOrDefault(c => c.Type.EndsWith("http://dnv.com/MyDNVGLId"));
//        //        }
//        //        //can't find MyDNVGL id, try to find MyDNVGL email
//        //        if (userLoginProviderKeyClaim == null)
//        //        {
//        //            userLoginProviderKeyClaim =
//        //                userClaimsPrincipal.Claims.SingleOrDefault(c => c.Type.EndsWith("claims/emailaddress"));
//        //        }
//        //        //if either id and email are not found, then user Indentity.Name in this case this is because it is windows authentication
//        //        var loginProviderKeyValue = userLoginProviderKeyClaim != null
//        //            ? userLoginProviderKeyClaim.Value
//        //            : userClaimsPrincipal.Identity.Name;

//        //        var currentPath = Request.Path.Value;
//        //        var tenantPathPart = TenantRepository.GetTenantPathPart(currentPath); 
//        //        loginProviderKeyValue += "|" + tenantPathPart;

//        //        //find the user with login infor
//        //        var user = await um.FindAsync(
//        //            new UserLoginInfo(userClaimsPrincipal.Identity.AuthenticationType, loginProviderKeyValue));
//        //        //if is Federation authentication, but can't find user login, this maybe because we only have MyDNVGL email as the login
//        //        //but the claim is MyDNVGL id, so we try to find the user email and compare it with the login
//        //        if (user == null && userClaimsPrincipal.Identity.AuthenticationType ==
//        //            LoginProvidersConstant.MY_DNVGL_AUTHENTICATION_TYPE)
//        //        {
//        //            string userId = loginProviderKeyValue;
//        //            //as MyDNVGL id is number or guid, so we check it is not an email
//        //            if (!userId.Contains("@"))
//        //            {
//        //                //success parsed, so get MyDNVGL email by api call
//        //                //var myDNVGlUserWebApi = _Container.Resolve<MyDNV.WebApi.IUserService>();
//        //                //var myDNVGlUsers = await myDNVGlUserWebApi.GetByIdAsync(userId);

//        //                //var myDNVGlUser = myDNVGlUsers?.FirstOrDefault();
//        //                //TODO: Do we need this code? See lines above!
//        //                var myDNVGlUser = new AppUser(); //Hack to get PowerBIApp code to compile. 
//        //                if (myDNVGlUser != null)
//        //                {
//        //                    //we find the user in MyDNVGL, then try to use number id or email as login to find the user in PowerBIApp
//        //                    foreach (var checkId in new[] { userId, myDNVGlUser.Email, myDNVGlUser.Id})
//        //                    {
//        //                        user = await um.FindAsync(
//        //                            new UserLoginInfo(userClaimsPrincipal.Identity.AuthenticationType, checkId));
//        //                        if (user != null)
//        //                        {
//        //                            break;
//        //                        }
//        //                    }

//        //                    if (user != null)
//        //                    {
//        //                        //we find it
//        //                        //so convert to email logininfo to guid id logininfo
//        //                        await um.AddLoginAsync(user.Id,
//        //                            new UserLoginInfo(userClaimsPrincipal.Identity.AuthenticationType,
//        //                                loginProviderKeyValue));
//        //                        await um.RemoveLoginAsync(user.Id,
//        //                            new UserLoginInfo(userClaimsPrincipal.Identity.AuthenticationType,
//        //                                myDNVGlUser.Email));
//        //                    }
//        //                }
//        //            }

//        //        }
//        //        if (user != null)
//        //        {
//        //            var identity = await um.CreateIdentityAsync(user, LoginProvidersConstant.MYQRA_AUTHENTICATION_TYPE);
//        //            PowerBIAppClaimsAuthorizationManager.ResetIdentityAuthorizeClaims(identity);
//        //            Helper.AddUserIdentity(identity);
//        //            ticket = new AuthenticationTicket(
//        //                identity, new AuthenticationProperties
//        //                {
//        //                    IsPersistent = true,
//        //                    IssuedUtc = DateTimeOffset.UtcNow,
//        //                    ExpiresUtc = DateTimeOffset.UtcNow + Options.ExpireTimeSpan
//        //                });
//        //        }
//        //    }
//        //    catch (Exception ex)
//        //    {
//        //        Debug.WriteLine(ex);
//        //    }
//        //    finally
//        //    {
//        //        if (!InstanceControlConstant.ONE_USER_MANAGER_PER_REQUEST)
//        //        {
//        //            um.Dispose();
//        //        }
//        //    }

//        //    return ticket;
//        //}

//        #endregion
//    }
//}