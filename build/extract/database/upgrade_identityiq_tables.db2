--
-- This script contains DDL statements to upgrade a database schema to
-- reflect changes to the model.  This file should only be used to
-- upgrade from the last formal release version to the current code base.
--

CONNECT TO iiq;

-- Environment Monitoring

create table identityiq.spt_monitoring_statistic (
        id varchar(32) not null,
        created bigint,
        modified bigint,
        owner varchar(32),
        assigned_scope varchar(32),
        assigned_scope_path varchar(450),
        name varchar(128) not null unique,
        display_name varchar(128),
        description varchar(1024),
        value varchar(4000),
        value_type varchar(128),
        type varchar(128),
        attributes clob(100000000),
        template smallint,
        name_ci generated always as (upper(name)),
        primary key (id)
    ) IN identityiq_ts;

create table identityiq.spt_monitoring_statistic_tags (
        statistic_id varchar(32) not null,
        elt varchar(32) not null
    ) IN identityiq_ts;

alter table identityiq.spt_monitoring_statistic
    add constraint FK9B2F43A1A5FB1B1
    foreign key (owner)
    references identityiq.spt_identity;

create index identityiq.FK9B2F43A1A5FB1B1 on identityiq.spt_monitoring_statistic (owner);

alter table identityiq.spt_monitoring_statistic
    add constraint FK9B2F43A1486634B7
    foreign key (assigned_scope)
    references identityiq.spt_scope;

create index identityiq.FK9B2F43A1486634B7 on identityiq.spt_monitoring_statistic (assigned_scope);

alter table identityiq.spt_monitoring_statistic_tags
    add constraint FK770FC5F7E6181207
    foreign key (elt)
    references identityiq.spt_tag;

create index identityiq.FK770FC5F7E6181207 on identityiq.spt_monitoring_statistic_tags (elt);

alter table identityiq.spt_monitoring_statistic_tags
    add constraint FK770FC5F7315E4612
    foreign key (statistic_id)
    references identityiq.spt_monitoring_statistic;

create index identityiq.FK770FC5F7315E4612 on identityiq.spt_monitoring_statistic_tags (statistic_id);

create index identityiq.SPT_IDXF89E6D4D93CDB0EE on identityiq.spt_monitoring_statistic (assigned_scope_path);

create index identityiq.spt_monitoring_statistic_name on identityiq.spt_monitoring_statistic (name_ci);

create table identityiq.spt_server_statistic (
        id varchar(32) not null,
        created bigint,
        modified bigint,
        name varchar(128) not null,
        snapshot_name varchar(128),
        value varchar(4000),
        value_type varchar(128),
        host varchar(32),
        attributes clob(100000000),
        target varchar(128),
        target_type varchar(128),
        monitoring_statistic varchar(32),
        primary key (id)
    ) IN identityiq_ts;

alter table identityiq.spt_server_statistic
        add constraint FKD8C394DC9755032B
        foreign key (host)
        references identityiq.spt_server;

create index identityiq.FKD8C394DC9755032B on identityiq.spt_server_statistic (host);

alter table identityiq.spt_server_statistic
        add constraint FKD8C394DCAAD6EDC1
        foreign key (monitoring_statistic)
        references identityiq.spt_monitoring_statistic;

create index identityiq.FKD8C394DCAAD6EDC1 on identityiq.spt_server_statistic (monitoring_statistic);

create index identityiq.server_stat_snapshot on identityiq.spt_server_statistic (snapshot_name);


alter table identityiq.spt_server add extended1 varchar(255);
set integrity for identityiq.spt_server off;
alter table identityiq.spt_server add extended1_ci generated always as (upper(extended1));
set integrity for identityiq.spt_server_statistic,identityiq.spt_server immediate checked force generated;
create index identityiq.spt_server_extended1_ci on identityiq.spt_server (extended1_ci);

-- End Environment Monitoring

-- Request reliability

create table identityiq.spt_request_state (
        id varchar(32) not null,
        created bigint,
        modified bigint,
        name varchar(450),
        attributes clob(100000000),
        request_id varchar(32),
        primary key (id)
    ) IN identityiq_ts;


alter table identityiq.spt_request_state
        add constraint FKDCED76591A9F1D1A
        foreign key (request_id)
        references identityiq.spt_request;

create index identityiq.FKDCED76591A9F1D1A on identityiq.spt_request_state (request_id);

-- End Request reliability

-- Add lock to WorkflowCase
alter table identityiq.spt_workflow_case add iiqLock varchar(128);


-- Drop case-sensitive CertificationItem.targetDisplayName index, and recreate as case-insensitive.

set integrity for identityiq.spt_certification_item off;
alter table identityiq.spt_certification_item add target_display_name_ci generated always as (upper(target_display_name));
alter table identityiq.spt_certification_item add exception_attribute_name_ci generated always as (upper(exception_attribute_name));
set integrity for identityiq.spt_cert_item_applications,identityiq.spt_certification_item,identityiq.spt_entitlement_snapshot,identityiq.spt_identity_entitlement,identityiq.spt_snapshot_permissions immediate checked force generated;
drop index identityiq.spt_certification_item_tdn;
create index identityiq.spt_certification_item_tdn_ci on identityiq.spt_certification_item (target_display_name_ci);
drop index identityiq.spt_cert_item_att_name;
create index identityiq.spt_cert_item_att_name_ci on identityiq.spt_certification_item (exception_attribute_name_ci);

-- Pending Certification reference

alter table identityiq.spt_certification_entity add pending_certification varchar(32);

create index identityiq.spt_cert_entity_pending on identityiq.spt_certification_entity (pending_certification);

-- Add selfCertificationReassignment column
alter table identityiq.spt_certification add self_cert_reassignment smallint default 0 not null;

-- Add attributes to RemediationItem
alter table identityiq.spt_remediation_item add attributes clob(100000000);

-- Add Identity.type column
alter table identityiq.spt_identity add type varchar(128);
alter table identityiq.spt_identity add software_version varchar(128);
set integrity for identityiq.spt_identity off;
alter table identityiq.spt_identity add type_ci generated always as (upper(type));
alter table identityiq.spt_identity add software_version_ci generated always as (upper(software_version));
set integrity for identityiq.spt_account_group,identityiq.spt_account_group_inheritance,identityiq.spt_account_group_perms,identityiq.spt_account_group_target_perms,identityiq.spt_activity_constraint,identityiq.spt_activity_data_source,identityiq.spt_activity_time_periods,identityiq.spt_alert,identityiq.spt_alert_action,identityiq.spt_alert_definition,identityiq.spt_app_dependencies,identityiq.spt_app_secondary_owners,identityiq.spt_application,identityiq.spt_application_activity,identityiq.spt_application_remediators,identityiq.spt_application_schema,identityiq.spt_application_scorecard,identityiq.spt_arch_cert_item_apps,identityiq.spt_archived_cert_entity,identityiq.spt_archived_cert_item,identityiq.spt_audit_config,identityiq.spt_audit_event,identityiq.spt_authentication_answer,identityiq.spt_authentication_question,identityiq.spt_batch_request,identityiq.spt_batch_request_item,identityiq.spt_bundle,identityiq.spt_bundle_archive,identityiq.spt_bundle_children,identityiq.spt_bundle_permits,identityiq.spt_bundle_requirements,identityiq.spt_capability,identityiq.spt_capability_children,identityiq.spt_capability_rights,identityiq.spt_category,identityiq.spt_cert_action_assoc,identityiq.spt_cert_item_applications,identityiq.spt_certification,identityiq.spt_certification_action,identityiq.spt_certification_archive,identityiq.spt_certification_challenge,identityiq.spt_certification_def_tags,identityiq.spt_certification_definition,identityiq.spt_certification_delegation,identityiq.spt_certification_entity,identityiq.spt_certification_group,identityiq.spt_certification_groups,identityiq.spt_certification_item,identityiq.spt_certification_tags,identityiq.spt_certifiers,identityiq.spt_child_certification_ids,identityiq.spt_configuration,identityiq.spt_correlation_config,identityiq.spt_custom,identityiq.spt_dashboard_content,identityiq.spt_dashboard_content_rights,identityiq.spt_dashboard_layout,identityiq.spt_dashboard_reference,identityiq.spt_deleted_object,identityiq.spt_dictionary,identityiq.spt_dictionary_term,identityiq.spt_dynamic_scope,identityiq.spt_dynamic_scope_exclusions,identityiq.spt_dynamic_scope_inclusions,identityiq.spt_email_template,identityiq.spt_email_template_properties,identityiq.spt_entitlement_group,identityiq.spt_entitlement_snapshot,identityiq.spt_file_bucket,identityiq.spt_form,identityiq.spt_generic_constraint,identityiq.spt_group_definition,identityiq.spt_group_factory,identityiq.spt_group_index,identityiq.spt_group_permissions,identityiq.spt_identity,identityiq.spt_identity_archive,identityiq.spt_identity_assigned_roles,identityiq.spt_identity_bundles,identityiq.spt_identity_capabilities,identityiq.spt_identity_controlled_scopes,identityiq.spt_identity_dashboard,identityiq.spt_identity_entitlement,identityiq.spt_identity_history_item,identityiq.spt_identity_request,identityiq.spt_identity_request_item,identityiq.spt_identity_role_metadata,identityiq.spt_identity_snapshot,identityiq.spt_identity_trigger,identityiq.spt_identity_workgroups,identityiq.spt_integration_config,identityiq.spt_jasper_files,identityiq.spt_jasper_page_bucket,identityiq.spt_jasper_result,identityiq.spt_jasper_template,identityiq.spt_link,identityiq.spt_localized_attribute,identityiq.spt_managed_attr_inheritance,identityiq.spt_managed_attr_perms,identityiq.spt_managed_attr_target_perms,identityiq.spt_managed_attribute,identityiq.spt_message_template,identityiq.spt_mining_config,identityiq.spt_mitigation_expiration,identityiq.spt_monitoring_statistic,identityiq.spt_monitoring_statistic_tags,identityiq.spt_object_config,identityiq.spt_partition_result,identityiq.spt_password_policy,identityiq.spt_password_policy_holder,identityiq.spt_persisted_file,identityiq.spt_plugin,identityiq.spt_policy,identityiq.spt_policy_violation,identityiq.spt_process_log,identityiq.spt_profile,identityiq.spt_profile_constraints,identityiq.spt_profile_permissions,identityiq.spt_provisioning_request,identityiq.spt_quick_link,identityiq.spt_quick_link_options,identityiq.spt_remediation_item,identityiq.spt_remote_login_token,identityiq.spt_request,identityiq.spt_request_arguments,identityiq.spt_request_definition,identityiq.spt_request_definition_rights,identityiq.spt_request_returns,identityiq.spt_request_state,identityiq.spt_resource_event,identityiq.spt_right,identityiq.spt_right_config,identityiq.spt_role_index,identityiq.spt_role_metadata,identityiq.spt_role_mining_result,identityiq.spt_role_scorecard,identityiq.spt_rule,identityiq.spt_rule_dependencies,identityiq.spt_rule_registry,identityiq.spt_rule_registry_callouts,identityiq.spt_rule_signature_arguments,identityiq.spt_rule_signature_returns,identityiq.spt_schema_attributes,identityiq.spt_scope,identityiq.spt_score_config,identityiq.spt_scorecard,identityiq.spt_server_statistic,identityiq.spt_sign_off_history,identityiq.spt_snapshot_permissions,identityiq.spt_sodconstraint,identityiq.spt_sodconstraint_left,identityiq.spt_sodconstraint_right,identityiq.spt_sync_roles,identityiq.spt_tag,identityiq.spt_target,identityiq.spt_target_association,identityiq.spt_target_source,identityiq.spt_target_sources,identityiq.spt_task_definition,identityiq.spt_task_definition_rights,identityiq.spt_task_event,identityiq.spt_task_result,identityiq.spt_task_signature_arguments,identityiq.spt_task_signature_returns,identityiq.spt_time_period,identityiq.spt_uiconfig,identityiq.spt_uipreferences,identityiq.spt_widget,identityiq.spt_work_item,identityiq.spt_work_item_archive,identityiq.spt_work_item_comments,identityiq.spt_work_item_config,identityiq.spt_work_item_owners,identityiq.spt_workflow,identityiq.spt_workflow_case,identityiq.spt_workflow_registry,identityiq.spt_workflow_rule_libraries,identityiq.spt_workflow_target immediate checked force generated;
create index identityiq.spt_identity_sw_version_ci on identityiq.spt_identity (software_version_ci);
create index identityiq.spt_identity_type_ci on identityiq.spt_identity (type_ci);

alter table identityiq.spt_identity add administrator varchar(32);
alter table identityiq.spt_identity 
	add constraint FK47706246DD2B81CB
	foreign key (administrator)
	references identityiq.spt_identity;
create index identityiq.FK47706246DD2B81CB on identityiq.spt_identity (administrator);

--
-- This is necessary to maintain the schema version. DO NOT REMOVE.
--
update identityiq.spt_database_version set schema_version = '7.3-11' where name = 'main';
