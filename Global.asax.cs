using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.WebHost;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.SessionState;
using PowerBIApp.Data;
using PowerBIApp.Web.App_Start;

namespace PowerBIApp.Web
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            MappingConfig.RegisterMaps();

            Microsoft.ApplicationInsights.Extensibility.TelemetryConfiguration.Active.InstrumentationKey = System.Web.Configuration.WebConfigurationManager.AppSettings["iKey"];
            
            //Avoid selfref. issue in EF 
            HttpConfiguration config = GlobalConfiguration.Configuration;
            config.Formatters.JsonFormatter
                .SerializerSettings
                .ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            config.Formatters.JsonFormatter.MaxDepth = 1;

#if DEBUG
            SeedDatabase2();
#endif
        }

        private void SeedDatabase2()
        {
            PowerBIAppContext ctx = new PowerBIAppContext();
            PowerBIAppInitializer seeder = new PowerBIAppInitializer(ctx);
            seeder.Seed().Wait();
        }

        protected void Application_PostAuthorizeRequest()
        {
            // WebApi SessionState
            var routeData = RouteTable.Routes.GetRouteData(new HttpContextWrapper(HttpContext.Current));
            if (routeData != null && routeData.RouteHandler is HttpControllerRouteHandler)
                HttpContext.Current.SetSessionStateBehavior(SessionStateBehavior.Required);
        }
    }
}
