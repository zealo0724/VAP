using System.Web;
using System.Web.Mvc;
using PowerBIApp.Web.Filters;

namespace PowerBIApp.Web
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            //filters.Add(new CustomAuthorizeAttribute());
            filters.Add(new ErrorHandler.AiHandleErrorAttribute());
        }
    }
}
