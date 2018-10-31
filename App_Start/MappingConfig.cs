using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using PowerBIApp.Model;
using PowerBIApp.Model.ViewModel;

namespace PowerBIApp.Web.App_Start
{
    public static class MappingConfig
    {
        public static void RegisterMaps()
        {
            AutoMapper.Mapper.Initialize(config =>
            {
                config.AddProfile<PowerBIAppMappingProfile>();
                //config.CreateMap<PowerBiReport, PowerBiReportAdminModel>()
                //      .ForMember(dest => dest.ReportLocation, opt => opt.MapFrom(src => src.ReportLocation.ShortName));
            });
        }
    }
}