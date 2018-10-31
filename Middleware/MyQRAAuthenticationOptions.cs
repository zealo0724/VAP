//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;
//using PowerBIApp.Common.Services.Security;
//using Microsoft.Owin.Security;

//namespace PowerBIApp.Web.Middleware
//{
//    public class PowerBIAppAuthenticationOptions : AuthenticationOptions
//    {
//        /// <summary>
//        /// Initialize properties of AuthenticationOptions base class
//        /// </summary>
//        public PowerBIAppAuthenticationOptions()
//            : base(LoginProvidersConstant.MYQRA_AUTHENTICATION_TYPE)
//        {
//            AuthenticationMode = AuthenticationMode.Passive;
//            ExpireTimeSpan = new TimeSpan(0, 5, 0);
//        }

//        public TimeSpan ExpireTimeSpan { get; set; }
//    }
//}