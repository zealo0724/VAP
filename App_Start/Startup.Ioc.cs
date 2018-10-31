using System;
using System.Linq;
using System.Security;
using System.Web;
using System.Web.Http.ExceptionHandling;
using CB.Ioc;
using CB.Ioc.Mvc;
using CB.Ioc.WebApi;
using PowerBIApp.Common;
using PowerBIApp.Model;
using PowerBIApp.Web.Common;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Owin;
using PowerBIApp.Data;
using PowerBIApp.Model;

namespace PowerBIApp.Web
{
	public partial class Startup
	{
        protected IContainer InitIocContainer(IAppBuilder app)
	    {
	        IContainerBuilder builder = new CB.Ioc.Adapter.Autofac.AutofacBuilder();
	        foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies().Where(a => a.GetName().Name.StartsWith("PowerBIApp")))
	        {
	            try
	            {
	                builder.RegisterAssemblyTypes(assembly);

	            }
	            catch (Exception e)
	            {
	                Console.WriteLine(e);
	                throw;
	            }
	        }
	        var webAssembly = typeof (Startup).Assembly;
	        builder.RegisterMvcControllers(webAssembly);
	        builder.RegisterWebApiControllers(webAssembly);

            app.CreatePerOwinContext<PowerBIAppContext>((options, context) => CreateDbContext());
            app.CreatePerOwinContext<UserManager<AppUser>>(CreateUserManager);
            
	        builder.Register(
	            (container, o) =>
	            {
	                if (HttpContext.Current == null)
	                {
	                    container.Resolve<ITaskContextHelper>().RestoreContext();
	                }
	                return HttpContext.Current.GetOwinContext().Get<PowerBIAppContext>();
	            });
            builder.Register(
                (container, o) =>
                {
                    if (HttpContext.Current == null)
                    {
                        container.Resolve<ITaskContextHelper>().RestoreContext();
                    }
                    return HttpContext.Current.GetOwinContext().Get<AppUser>();
                });
	        builder.Register(
	            (container, o) =>
	            {
                    //can't specify dbcontext, because we will user resolve to get it which will only create one instance perrequest\
                    if (o != null && o.Any())
                    {
                        //ToDo Make sure the db context needn't be passed and will be one instance per request
                        //throw new NotSupportedException();
                    }
                    if (HttpContext.Current == null)
                    {
                        container.Resolve<ITaskContextHelper>().RestoreContext();
                    }
                    return HttpContext.Current.GetOwinContext().GetUserManager<UserManager<AppUser>>();
	            });
            builder.Register(
                (container, o) =>
                {
                    if (HttpContext.Current == null)
                    {
                        container.Resolve<ITaskContextHelper>().RestoreContext();
                    }
                    var request = HttpContext.Current.Request;
                    var owin = HttpContext.Current.GetOwinContext();
                    var info = owin.Get<IApplicationInformation>();
                    if (info == null)
                    {
                        info = new ApplicationInformation(string.Format("{0}://{1}{2}", request.Url.Scheme, request.Url.Authority, HttpRuntime.AppDomainAppVirtualPath));
                        owin.Set<IApplicationInformation>(info);
                    }
                    return info;
                });

            //TODO: register more services!
	        //builder.Register<MyDNV.WebApi.IUserService, MyDNV.WebApi.Services.UserService>();
            //builder.Register<MyDNV.WebApi.ISubscriptionService, MyDNV.WebApi.Services.SubscriptionService>();
            //builder.Register<MyDNV.WebApi.IMessageService, MyDNV.WebApi.Services.MessageService>();
	        
            var result = builder.BuildContainer();
            ExtensionHelper.FContainer = result;
            return result;
	    }
        
	    protected void ConfigIocForMvcAndWebApi(IContainer container, System.Web.Http.HttpConfiguration webApiConfiguration)
	    {
            System.Web.Mvc.DependencyResolver.SetResolver(new MvcDependencyResolver(container));
            webApiConfiguration.DependencyResolver = new WebApiDependencyResolver(container);
            webApiConfiguration.Services.Add(typeof(IExceptionLogger), container.Resolve<IExceptionLogger>());
	    }

        public static PowerBIAppContext CreateDbContext()
        {
            return new PowerBIAppContext();
        }

        public static UserManager<AppUser> CreateUserManager(IdentityFactoryOptions<UserManager<AppUser>> options, IOwinContext context)
        {
            //throw new NotImplementedException("Use Ioc");
            var manager = new UserManager<AppUser>(new UserStore<AppUser>(context.Get<PowerBIAppContext>()));
            //var manager = new ApplicationUserManager(new AzureStore<ApplicationUser>());
            manager.UserValidator = new UserValidator<AppUser>(manager)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };
            manager.PasswordValidator = new PasswordValidator
            {
                RequiredLength = 6,
                RequireNonLetterOrDigit = true
            };
            var dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null)
            {
                manager.UserTokenProvider = new DataProtectorTokenProvider<AppUser>(dataProtectionProvider.Create("PasswordReset"));
            }
            return manager;
        }
	}
}