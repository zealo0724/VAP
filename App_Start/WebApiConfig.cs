using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace PowerBIApp.Web
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "AdminApi",
                routeTemplate: "{tenantname}/webapi/admin/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "{tenantname}/webapi/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );


        }
    }
}
