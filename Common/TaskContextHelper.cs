using System;
using System.CodeDom;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Threading;
using System.Web;
using CB.Ioc;
using PowerBIApp.Common;

namespace PowerBIApp.Web.Common
{
    /// <summary>
    /// Important!! must SingleInstance = SingleInstance.SingletonPerLifetimeScope
    /// </summary>
    [TypeInjection(AsType = typeof(ITaskContextHelper), SingleInstance = SingleInstance.SingletonPerLifetimeScope)]
    public class TaskContextHelper : ITaskContextHelper
    {
        private HttpContext _CachedContext;

        #region Implementation of ITaskContextHelper

        public void PrepareContext()
        {
            _CachedContext = HttpContext.Current;
        }

        public void RestoreContext()
        {
            if (HttpContext.Current == null)
            {
                CallContext.HostContext = _CachedContext;
            }
        }

        #endregion
    }
}