using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security;
using System.Threading;
using System.Web.Http;
using System.Xml;
using PowerBIApp.Common.Services;
using PowerBIApp.Common.Services.Security;
using PowerBIApp.Model;
using PowerBIApp.Web;
using PowerBIApp.Web.Common;
using PowerBIApp.Web.Controllers;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Extensions;
using Owin;
using CB.Ioc;
using Microsoft.Owin.Cors;
using PowerBIApp.Common.Services;
using PowerBIApp.Data;

[assembly: OwinStartup(typeof(Startup))]

namespace PowerBIApp.Web
{
    public partial class Startup
    {
        PowerBIAppContext _dbContext = new PowerBIAppContext();
        static Startup()
        {
            //System.Data.Entity.Database.SetInitializer(new MigrateDatabaseToLatestVersion<PowerBIAppContext, Configuration>());
            using (var db = new PowerBIAppContext())
            {
                //db.Database.Initialize(true);
            }

            try
            {
                XmlNode myNode = GetXmlNodeByXpath(AppDomain.CurrentDomain.BaseDirectory + "\\publishInfo.xml", "//jsVersion");
                JsFileVersion = int.Parse(myNode.InnerText);
            }
            catch
            {
                JsFileVersion = -1;
            }
        }

        private static readonly HashSet<string> _NorskLangs = new HashSet<string> { "no", "nn", "nb" };

        public static int JsFileVersion = 0;
        public static DateTime LastUpdateTime;
        public static DateTime LastCheckTime = DateTime.Now;
        public static int UpdateFileVersion()
        {
            if (JsFileVersion == -1)
                return JsFileVersion;
            try
            {
                if (DateTime.Now.Subtract(LastCheckTime).Duration().TotalSeconds < 60)
                {
                    return JsFileVersion;
                }
                DateTime fileUpdTime = JsFileUpdateTime(new string[] {"\\dist\\main-client.js", "\\dist\\vendor.js", "\\dist\\site.css"});
                if (LastUpdateTime != fileUpdTime)
                {
                    LastUpdateTime = fileUpdTime;
                    PlusFileVersion();
                }
                LastCheckTime = DateTime.Now;
                return JsFileVersion;
            }
            catch
            {
                return JsFileVersion;
            }
        }

        public static void PlusFileVersion()
        {
            JsFileVersion++;
            XmlDocument xmlDoc = new XmlDocument();
            xmlDoc.Load(AppDomain.CurrentDomain.BaseDirectory + "\\publishInfo.xml");
            XmlNode xmlNode = xmlDoc.SelectSingleNode("//jsVersion");
            xmlNode.InnerText = JsFileVersion.ToString();
            xmlDoc.Save(AppDomain.CurrentDomain.BaseDirectory + "\\publishInfo.xml");
        }

        public static DateTime JsFileUpdateTime(string[] scanedFiles)
        {
            DateTime latestUpdateTime = new DateTime();
            foreach (var file in scanedFiles)
            {
                FileInfo fif = new System.IO.FileInfo(AppDomain.CurrentDomain.BaseDirectory + file);
                if (fif.LastWriteTime > latestUpdateTime)
                    latestUpdateTime = fif.LastWriteTime;
            }
            
            if (latestUpdateTime != null)
            {
                return latestUpdateTime;
            }
            return DateTime.Now;
        }

        public static XmlNode GetXmlNodeByXpath(string xmlFileName, string xpath)
        {
            FileInfo fif = new System.IO.FileInfo(xmlFileName);
            if (!fif.Exists)
            {
                XmlDocument newXmlDoc = new XmlDocument();
                XmlNode node = newXmlDoc.CreateXmlDeclaration("1.0", "utf-8", "");
                newXmlDoc.AppendChild(node);
                XmlNode root = newXmlDoc.CreateElement("jsVersion");
                root.InnerText = "0";
                newXmlDoc.AppendChild(root);
                newXmlDoc.Save(xmlFileName);
            }
            XmlDocument xmlDoc = new XmlDocument();

            try
            {
                xmlDoc.Load(xmlFileName);
                XmlNode xmlNode = xmlDoc.SelectSingleNode(xpath);
                return xmlNode;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);

            var container = InitIocContainer(app);

            //var corsPolicy = new CorsPolicy
            //{
            //    AllowAnyMethod = true,
            //    AllowAnyHeader = true,
            //    SupportsCredentials = true
            //};

            //corsPolicy.Origins.Add(ExtensionHelper.GetCognosReportServerDomain());

            //var corsOptions = new CorsOptions
            //{
            //    PolicyProvider = new CorsPolicyProvider
            //    {
            //        PolicyResolver = context => Task.FromResult(corsPolicy)
            //    }
            //};

            //app.UseCors(corsOptions);
//            app.UseCors(CorsOptions.AllowAll);

//            app.UserPowerBIAppAuthentication(container);

//            app.Use(async (context, next) =>
//            {
//                try
//                {
//                    await next();
//                }
//                catch (SecurityException)
//                {
//                    context.ResposeUnauthorized();
//                }
//            });

//            app.Use(
//            (context, next) =>
//            {
//                if (_NorskLangs.Contains(CultureInfo.CurrentUICulture.TwoLetterISOLanguageName))
//                {
//                    var customCulture = new CultureInfo(CultureInfo.CurrentUICulture.Name, true)
//                    {
//                        DateTimeFormat =
//            {
//ShortDatePattern = "yyyy-MM-dd",
//LongDatePattern = "yyyy-MMMM-dd dddd"
//            }
//                    };
//                    Thread.CurrentThread.CurrentUICulture = Thread.CurrentThread.CurrentCulture = customCulture;
//                }
//                return next.Invoke();
//            });
//            app.UseStageMarker(PipelineStage.AcquireState);

//            //init the User in OwinContext so that it can be resolved by Ioc
//            app.Use(
//            async (context, next) =>
//            {
//                var identity = context.Request.User.GetPowerBIAppAuthenticationIdentity();
//                AppUser user = null;
//                if (identity != null)
//                {
//        //TODO: Get by tenant
//        user = context.GetUserManager<UserManager<AppUser>>().FindByName(identity.GetUserName());
//                }
//                if (user != null)
//                {
//                    context.Set(user);
//                }
//                await next();
//            });

//            //read/write User First Name Last Name from/to cookie
//            app.Use(
//            async (context, next) =>
//            {
//                const string NOTFIND = "Unknown User";
//                var fullName = context.Request.Cookies[ExtensionHelper.USER_FULL_NAME_COOKIE_KEY];
//                if (string.IsNullOrEmpty(fullName))
//                {
//                    fullName = NOTFIND;
//                    var user = ExtensionHelper.FContainer.Resolve<AppUser>();
//        //using (var userService = ExtensionHelper.FContainer.Resolve<IUserService>())
//        //{
//        //    var profile = await userService.GetProfileAsync(user);
//        //    if (profile != null)
//        //    {
//        //        fullName = string.Format("{0}|{1}", profile.FirstName, profile.LastName);
//        //    }
//        //}
//        fullName = $"{user.FirstName ?? string.Empty}|{user.LastName ?? string.Empty}";
//                    var expires = DateTime.UtcNow.AddDays(5);
//                    if (fullName == "|")
//                    {
//                        fullName = NOTFIND;
//                        expires = DateTime.UtcNow.AddMinutes(5);
//                    }
//                    context.Response.Cookies.Append(ExtensionHelper.USER_FULL_NAME_COOKIE_KEY, fullName, new CookieOptions { Expires = expires });
//                }
//                await next();
//            });

//            /*
//            app.Use(
//                async (context, next) =>
//                {
//                    var identity = context.Request.User.GetPowerBIAppAuthenticationIdentity();
//                    if (identity != null)
//                    {
//                        using (
//                            var dashboardService =
//                                ExtensionHelper.FContainer.Resolve<IQueryableService<PowerBIApp.Database.Data.Models.Dashboard, int>>())
//                        {
//                            var index = 0;
//                            foreach (
//                                var dashboard in
//                                    await dashboardService.Query().Where(d => d.IsShown).OrderBy(d => d.Order).AsNoTracking().ToArrayAsync())
//                            {
//                                var mi = new MenuInformation(string.Format("{0}_{1}", dashboard.Title, index++))
//                                {
//                                    Title = dashboard.Title,
//                                    ParentMenuNameKey = CommonConst.MORE_DASHBOARDS_BTN_MENU_KEY,
//                                    IEMode = IEMode.IE8,
//                                    ActionRouteValues = new {url = dashboard.Url},
//                                    Order = index //as Order is int but dashboard.Order is double so we use index instead as we have ordered then by Order
//                                };
//                                context.AddMenuInfo((HomeController controller) => controller.DashBoardWithUrl(string.Empty), mi);
//                            }
//                        }
//                    }
//                    await next();
//                });
//                */

            var webApiConfig = new HttpConfiguration();
            WebApiConfig.Register(webApiConfig);
            ConfigIocForMvcAndWebApi(container, webApiConfig);
            app.UseWebApi(webApiConfig);
        }
    }
}
