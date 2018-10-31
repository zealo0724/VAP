using System.Web.Mvc;

namespace PowerBIApp.Web.Filters
{
  public class ValidateModelAttribute : ActionFilterAttribute
  {
    public override void OnActionExecuting(ActionExecutingContext context)
    {
      base.OnActionExecuting(context);

      if (!context.Controller.ViewData.ModelState.IsValid)
      {
                //TODO: 
         // context.Result = new JsonResult{ContentType = "text/json", Data = context.Controller.ViewData.ModelState, JsonRequestBehavior = JsonRequestBehavior.AllowGet};
      }
    }
  }
}
