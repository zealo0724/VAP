using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using AutoMapper;
using PowerBIApp.Data;
using PowerBIApp.Model;
using PowerBIApp.Model.ViewModel;
using PowerBIApp.Web.Filters;
using SecurityActions = PowerBIApp.Common.Security.Actions;


namespace PowerBIApp.Web.Controllers.WebApi
{
    [System.Web.Mvc.Route("{tenant}/webapi/admin/[controller]")]
    [ValidateModel]
    //[CustomAuthorize(Roles = SYSTEM_ADMIN + "," + DATA_ADMIN + "," + USER_ADMIN)]
    public class EntityAdminController : MultiTenantWebApiController
    {
        
        //private ILogger<EntityAdminController> _logger;
        private IAdminRepository _adminRepo;

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
            _adminRepo = new AdminRepository(PowerBiAppContext, Tenant);
        }

        [HttpGet]
        public async Task<IHttpActionResult>Entities()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.DataReader, async () =>
                {

                var data = _adminRepo.GetEntities();
            foreach (var d in data)
            {
                if(d.ReportSequence==null)
                    continue;
                var seqenceList = d.ReportSequence.Split(',');
                var reports = new List<Report>();
                foreach (var sequence in seqenceList)
                {
                    var rep = d.Reports.FirstOrDefault(x => x.Id.ToString().Equals(sequence));
                    if (rep != null)
                        reports.Add(rep);
                }
                if (reports.Count > 0)
                    d.Reports = reports;

            }
            var result = Mapper.Map<IEnumerable<EntityTreeViewModel>>(data);
            return Json(result);
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult>GetEntityTypeProperties()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageEntities, async () =>
                {
            var result = _adminRepo.EntityTypeProperties();
            return Json(result);
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult>GetPropertyTypes()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageEntities, async () =>
            {
            var result = _adminRepo.PropertyTypes();
            return Json(result);
        });
        }

    [HttpPut]
        public async Task<IHttpActionResult> UpdateEntity([FromBody]EntityTreeViewModel entityTreeViewModel)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageEntities, async () =>
                {
            var updatedEntity = await _adminRepo.UpdateEntity(entityTreeViewModel);
            addOrDeleteEntityTypes(entityTreeViewModel);
            var updatedViewModel = Mapper.Map<EntityTreeViewModel>(updatedEntity);
            return Json(true);
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> DeleteEntity([FromBody]EntityTreeViewModel entityTreeViewModel)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageEntities, async () =>
            {
            var result = await _adminRepo.DeleteEntity(entityTreeViewModel.EntityId);

            //Don't need add new value for the function
            entityTreeViewModel.EntityTypeProperties = null;
            addOrDeleteEntityTypes(entityTreeViewModel);

            return Json(result);
            });
        }

    [HttpPost]
        public async Task<IHttpActionResult> AddEntity([FromBody] EntityTreeViewModel entityTreeViewModel)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageEntities, async () =>
            {
            var entityType = _adminRepo.GetEntityTypes().FirstOrDefault(t => t.Id == entityTreeViewModel.EntityTypeId);

            if (entityType != null)
                entityTreeViewModel.EntityTypeName = entityType.Name;

            var entity = new Entity
            {
                TenantId = Tenant.Id,
                EntityName = entityTreeViewModel.EntityName,
                EntityType = entityType
                //TODO: EntityProperties 
            };
            _adminRepo.AddEntity(entity);

            var entityTree = new EntityTree
            {
                TenantId = entity.TenantId,
                Entity = entity,
                EntityId = entity.Id,
                ParentId = entityTreeViewModel.ParentId,
                IsParent = false, //entityTreeViewModel.ParentId == 0,
                ReportSequence = entityTreeViewModel.Reports.Count==0 ? null : string.Join(",", entityTreeViewModel.Reports.Select(x=>x.Id))
            };
            _adminRepo.AddEntityTree(entityTree);

            entityTreeViewModel.EntityId = entity.Id;
            addOrDeleteEntityTypes(entityTreeViewModel);

            await _adminRepo.SaveAllAsync();

            entityTreeViewModel.EntityId = entity.Id;
            entityTreeViewModel.EntityTypeId = entity.EntityTypeId;
            entityTreeViewModel.Id = entityTree.Id;

            await _adminRepo.UpdateReports(entityTree, entityTreeViewModel.Reports);

            return Json(entityTreeViewModel);
            });
        }

        public void addOrDeleteEntityTypes(EntityTreeViewModel entityTreeViewModel)
        {
            //Remove all maps By tenantId, entitiyId, entityTypePropertyId
            var removeList = _adminRepo.GetEntityProperty()
                .Where(t => t.TenantId == Tenant.Id
                            && t.EntityId == entityTreeViewModel.EntityId);
            _adminRepo.DeleteEntityProperties(removeList.ToList());

            //Add all mpas by add list
            if (entityTreeViewModel.EntityTypeProperties != null && entityTreeViewModel.EntityTypeProperties.Count > 0)
            {
                var mapedEntityProperty =
                    Mapper.Map<IEnumerable<EntityProperty>>(entityTreeViewModel.EntityTypeProperties);
                foreach (var k in mapedEntityProperty)
                {
                    k.TenantId = Tenant.Id;
                    k.EntityId = entityTreeViewModel.EntityId;
                }
                _adminRepo.AddEntityProperties(mapedEntityProperty.ToList());
            }
        }

        [HttpGet]
        public async Task<IHttpActionResult>GetEntityTypes()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageEntities, async () =>
            {
            var data = _adminRepo.GetEntityTypes();
            return Json(data);
            });
        }

    [HttpGet]
        public async Task<IHttpActionResult>CheckEntityInuse(int entityId)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageEntities, async () =>
            {
            var appusers = _adminRepo.GetEntity(entityId).AppUsers;
            if (appusers.Count>0)
            {
                return Json(true);
            }
            else
            {
                return Json(false);
            }
            });
        }
    }
}
