//using System;
//using CB.Ioc;
//using PowerBIApp.Common.Services.Security;
//using Microsoft.Owin.Security;
//using Microsoft.Owin.Security.Cookies;
//using Owin;

//namespace PowerBIApp.Web.Middleware
//{
//    public static class PowerBIAppAuthenticationExtension
//    {
//        public static IAppBuilder UserPowerBIAppAuthentication(this IAppBuilder app, IScopeResolver container)
//        {
//            var options = new CookieAuthenticationOptions
//            {
//                AuthenticationType = LoginProvidersConstant.MYQRA_AUTHENTICATION_TYPE,
//                AuthenticationMode = AuthenticationMode.Active,
//                CookieName = ".AspNet." + LoginProvidersConstant.MYQRA_AUTHENTICATION_TYPE,
//                ExpireTimeSpan = TimeSpan.FromMinutes(20.0)
//            };
//            app.UseCookieAuthentication(options);

//            if (app == null)
//                throw new ArgumentNullException("app");
//            //var opt = new PowerBIAppAuthenticationOptions();
//            //app.Use<PowerBIAppAuthenticationMiddleware>(opt, container);
//            return app;
//        }
//    }
//}