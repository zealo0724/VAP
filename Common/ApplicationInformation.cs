using CB.Ioc;
using PowerBIApp.Common;

namespace PowerBIApp.Web.Common
{
    [TypeInjection(AsType = typeof(IApplicationInformation))]
    public class ApplicationInformation : IApplicationInformation
    {
        public ApplicationInformation(string rootUrl)
        {
            RootUrl = rootUrl;
        }

        #region Implementation of IApplicationInformation

        public string RootUrl { get; private set; }

        #endregion
    }
}