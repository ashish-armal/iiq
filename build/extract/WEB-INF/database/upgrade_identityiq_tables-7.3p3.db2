--
-- This script contains DDL statements to upgrade a database schema to
-- reflect changes to the model.  This file should only be used to
-- upgrade from the last formal release version to the current code base.
--

CONNECT TO iiq;

-- Add Request.live column
alter table identityiq.spt_request add live smallint default 0;
update identityiq.spt_request set live = 0;

--
-- IdentityAI recommendation schema changes
--
create table identityiq.spt_recommender_definition (
  id varchar(32) not null,
  created bigint,
  modified bigint,
  name varchar(128) not null,
  attributes clob(100000000),
  name_ci generated always as (upper(name)),
  primary key (id)
) IN identityiq_ts;

alter table identityiq.spt_recommender_definition
add constraint uk_ekuvq6a1uhwkxb7fofir077xv unique (name);

create index identityiq.spt_recommender_definition_nam on identityiq.spt_recommender_definition (name_ci);
alter table identityiq.spt_certification_item add column recommend_value varchar(100);

create table identityiq.spt_module (
  id varchar(32) not null,
  created bigint,
  modified bigint,
  name varchar(128) not null,
  description varchar(512),
  attributes clob(100000000),
  name_ci generated always as (upper(name)),
  primary key (id)
) IN identityiq_ts;

alter table identityiq.spt_module
add constraint uk_bebq8nsflsucu90sph68pf43r unique (name);

create index identityiq.spt_module_name on identityiq.spt_module (name_ci);

update identityiq.spt_database_version set schema_version = '7.3-13' where name = 'main';

