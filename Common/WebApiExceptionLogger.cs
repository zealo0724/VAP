using System;
using System.Diagnostics;
using System.Security;
using System.Text;
using System.Web.Http.ExceptionHandling;
using CB.Ioc;
using PowerBIApp.Common.Services;

namespace PowerBIApp.Web.Common
{
    [TypeInjection(AsType = typeof(IExceptionLogger))]
    [TypeInjection(AsType = typeof(ILogger))]
    public class WebApiExceptionLogger : ExceptionLogger, ILogger
    {
        private static bool _CAN_LOG = true;

        [Dependency]
        public IScopeResolver Container { get; set; }

        private static string ProcessException(Exception exception)
        {
            var sb = new StringBuilder();
            var exp = exception;
            while (exp != null)
            {
                sb.AppendLine(string.Format("Message: '{0}'", exp.Message));
                exp = exp.InnerException;
            }
            var msg = string.Format("Exception: \n{0}, StackTrace:'{1}'", sb, exception.StackTrace);
            return msg;
        }

        #region Overrides of ExceptionLogger

        /// <summary>
        /// Determines whether the exception should be logged.
        /// </summary>
        /// <returns>
        /// true if the exception should be logged; otherwise, false.
        /// </returns>
        /// <param name="context">The exception logger context.</param>
        public override bool ShouldLog(ExceptionLoggerContext context)
        {
            return _CAN_LOG && base.ShouldLog(context);
        }


        /// <summary>
        /// When overridden in a derived class, logs the exception synchronously.
        /// </summary>
        /// <param name="context">The exception logger context.</param>
        public override void Log(ExceptionLoggerContext context)
        {
            Log(context.Exception);
        }

        #endregion

        #region Implementation of ILogger

        public void Log(Exception exception)
        {
            var sSource = "PowerBIAppErrors";
            if (string.IsNullOrEmpty(sSource)) return;
            try
            {
                if (EventLog.SourceExists(sSource))
                {
                    EventLog.WriteEntry(sSource, ProcessException(exception), EventLogEntryType.Error);
                }
            }
            catch (SecurityException)
            {
                _CAN_LOG = false;
            }
        }

        #endregion
    }
}