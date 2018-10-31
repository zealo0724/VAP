//using System.Linq;
//using System.Security.Authentication;
//using System.Threading.Tasks;
//using System.Web.Routing;
//using CB.Ioc;
//using PowerBIApp.Model;
//using Microsoft.AspNet.Identity;
//using Microsoft.AspNet.Identity.EntityFramework;
//using Microsoft.Owin;
//using Microsoft.Owin.Security;
//using Microsoft.Owin.Security.Infrastructure;

//namespace PowerBIApp.Web.Middleware
//{
//    public class PowerBIAppAuthenticationMiddleware : AuthenticationMiddleware<PowerBIAppAuthenticationOptions>
//    {
//        private readonly IScopeResolver _Container;

//        public PowerBIAppAuthenticationMiddleware(OwinMiddleware next, PowerBIAppAuthenticationOptions options, IScopeResolver container)
//            : base(next, options)
//        {
//            _Container = container;
//        }

//        #region Overrides of AuthenticationMiddleware<PowerBIAppAuthenticationOptions>

//        protected override AuthenticationHandler<PowerBIAppAuthenticationOptions> CreateHandler()
//        {
//            return new PowerBIAppAuthenticationHandler(_Container);
//        }

//        #endregion
//    }
//}