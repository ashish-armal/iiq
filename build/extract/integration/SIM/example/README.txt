(c) Copyright 2011 SailPoint Technologies, Inc., All Rights Reserved.

----------------------------------------------------------------------
IdentityIQ/IDM Integration Demo Steps
----------------------------------------------------------------------

1) Deploy Classes

There are two components that need to be deployed to demonstrate the
intrgration: a .jar file that is deployed within the Sun IDM
application, and .class files that are deployed within the IIQ
application.  None of these are required for a real customer
deployment.

All of these are built by the normal IIQ build process, the IIQ .class
files needed to demonstrate the integration are included in the
standard installation image if you are not building from source.  In
releases prior to 5.2, the IIQ side of the integration included the
IntegrationExecutor, a few custom tasks related to role
synchronization, and a custom connector for a demo test database.  We
no longer support role synchronization so those classes have been
removed, and the IntegrationExecutor code has been merged with
SunIDMConnector.java in the main source tree, so the IIQ classes built
by this integration module reduce to just the Connector for the test
database (sailpoint.integration.idm.TestConnector).  This is only
required for this scripted demo, it is not required in production but
since it is currently part of the standard build process it will
always be there.

The .jar file that is deployed within Sun IDM is *not* included in the
standard IIQ distribution image (as far as I can tell anyway, need to
verify this).  You must either obtain a copy of the file
"iiqIntegration-SIM.jar" or build it from source.  We will assume that
you have access to the source tree.

The classes in iiqIntegration-SIM.jar provide three things: support
for requesting roles managed by IIQ in the IDM uesr interface, support
for notifying IIQ after a provisioning workflow has completed, and a
custom resource adapter for the integration demo database.  None of
these are required for a real deployment. Since we no longer support
role synchronization and IDM initiated role request, the "form util"
classes are no longer used.  Notifying IIQ after a provisioning
workflow has completed is still potentially useful but is optional
because it requires modification to the IDM workflows.  This is no
longer included in this demo.  The custom resource adapter is only
required for this demo.

To build iiq-simIntegration.jar from source you can use the normal IIQ
ant build.xml script at the root of the source tree, or you can build
just iiq-simIntegration.jar with the build.xml script under the
integration/idm/server directory.  However you build this it will not
be automatically copied to the IDM installation directory, you must
manually copy it to the "WEB-INF/lib" directory under the Sun IDM
installation.

The "install" ant target will copy iiq-simIntegration.jar if you have both
SPHOME and WSHOME set in your environment.  In addition to
iiq-simIntegration.jar, it will also copy the MySQL JDBC jar and a few
jars related to email from the IIQ build tree over to IDM.  The MySQL
JDBC jar is necessary for the demo.  The mail.jar and activation.jar
files are only necessary if you are running both IDM and IIQ under the
same Eclipse/Tomcat environment.  If you are integrating with an
exising Sun IDM application, do not use the install script, just copy
the iiq-simIntegration.jar file manually.  If you are on Windows
use install.bat, even if you use cygwin the install script won't
work with spaces in path names (such as c:\Program Files).

If you used the IIQ image for your installation, you'll need to copy
the openspml.jar file from the IDM/WEB-INF/lib directory to the
identityiq/WEB-INF/lib directory. This will require an app server
restart.


2) Prepare Demo Database

Install or locate a a MySQL instance.  Import the file demo.mysql 
located under the test directory.

   mysql -u root
   ...
   mysql> source demo.sql

This will create a database "identityiq" owned by user "identityiq"
with password "identityiq".  It will then create the three tables
used by the Sun test adapter, idm_users, idm_groups, and idm_members.
Finally it will insert a few example users.


3) Import IDM Configuration File

In the IDM console, import idminit.xml.  This file may be used with
IDM versions 7.1 and 8.0.

NOTE: If you change the definition of the demo resource to use an
adapter other than our TestAdapter, you may have difficulty importing
the Resource XML if it contains encrypted passwords.  IDM now uses a
system of rotating encryption keys that can't be known ahead of time,
and not all adapters support importing Resource definitions with
unencrypted passwords.  If you get errors related to "server key", you
will have to reencrypt any password fields in the XML using the IIQ
console so that they are encrypted using whatever keys are installed
in this IDM instance.  For example if you are trying to use the stock
JdbcResourceAdapter for MySQL, you will need to encrypt the Password
attribute.  Bring up the Lighthouse console (lh console) and use the
encrypt command:

     > encrypt identityiq

The console will display a long string of characters, copy this and
paste it as the value of the Password attribute in the Resource XML.
Do *not* attempt to use an ASCII password here, JdbcResourceAdapter
requires encrypted passwords.  For simple demos, it is best if you
stay with TestResourceAdapter that extends JdbcResourceAdapter and
supports unencrypted passwords.


4) Run IDM Reconciliation

The IDM config file contains a definition of a resource that will
bring in users from the MySQL test database.  A reconciliation against
of this resource will be necessary but first you must edit the recon
policy.

Log into the IDM application and select the "Resources" tab.  Click
the arrow next to "IDM/IdentityIQ Integration [1]".  This is the name
of a resource type, expanding the folder will show you the resources
of this type, there will be one named "IDM/IdentityIQ Integration
Demo".  Select the checkbox next to the resource and select "Edit
Reconciliation Policy" from the "Resource Actions" menu.

Set "Reconciliation Modes" to "Full only".  In "Situation Options"
find "UNMATCHED" and select "Create new user...".  Save.

Check the box next to the resource again and then select the "Full
Reconciliation Now" resource action.  Wait a few seconds, then go to
the "Accounts" tab.  There should be three new users: idm1, idm2, and idm3.


5) Enable SPML Trace

This is an optional step for debugging communication between IIQ and IDM.
When you enable SPML trace, the XML for every SPML request and response 
will be emitted to the log4j logs.  

Edit the WEB-INF/web.xml from the IDM installation, find the servlet
definition for "rpcrouter2" and add the "trace" parameter with value "true".

  <servlet>
    <servlet-name>rpcrouter2</servlet-name>
    <display-name>OpenSPML SOAP Router</display-name>
    <description>no description</description>
    <servlet-class>
        org.openspml.server.SOAPRouter
    </servlet-class>
    <init-param>
      <param-name>handlers</param-name>
      <param-value>com.waveset.rpc.PasswordSyncHandler</param-value>
    </init-param>
    <init-param>
      <param-name>spmlHandler</param-name>
      <param-value>com.waveset.rpc.SpmlHandler</param-value>
    </init-param>
    <init-param>
      <param-name>rpcHandler</param-name>
      <param-value>com.waveset.rpc.RemoteSessionHandler</param-value>
    </init-param>

    <!-- add this -->
    <init-param>
      <param-name>trace</param-name>
      <param-value>true</param-value>
    </init-param>
  </servlet>

On the IIQ side enable log4j debug level trace in 
sailpoint.connector.SunIDMConnector.


5) Configure IdentityIQ

In the IdentityIQ console, import iiqinit.xml.
Exit the console and run the integration console with:

    iiq integration

Execute "list" to make sure that "Sun IDM" is displayed under "Applications".

Execute "use Sun" to select the Sun IDM connector.

Execute "listAccounts" to do a basic connection check and verify that
we can pull over the names of IDM users.  

If you enabled trace as discussed in step 5 you should see the XML for
SPML messages being sent and received in the integration console.  The
same messages should appear in the logs of the app server hosting IDM.
Toward the end of the console output you should see messages like this:

    2011-02-22 13:59:18,891 DEBUG main sailpoint.connector.SunIDMConnector:1166 - Number accountIds fetched: 6
    2011-02-22 13:59:18,892  INFO main sailpoint.connector.SunIDMConnector:1172 - Initial Object Read... Number of ids read from idm [6] in 1 s 328 ms
    2011-02-22 13:59:18,895 DEBUG main sailpoint.connector.SunIDMConnector:1215 - Fetching [Administrator]
    Administrator
    2011-02-22 13:59:18,895 DEBUG main sailpoint.connector.SunIDMConnector:1215 - Fetching [Configurator]
    Configurator
    2011-02-22 13:59:18,896 DEBUG main sailpoint.connector.SunIDMConnector:1215 - Fetching [demoapprover]
    demoapprover
    2011-02-22 13:59:18,896 DEBUG main sailpoint.connector.SunIDMConnector:1215 - Fetching [idm1]
    idm1
    2011-02-22 13:59:18,897 DEBUG main sailpoint.connector.SunIDMConnector:1215 - Fetching [idm2]
    idm2
    2011-02-22 13:59:18,897 DEBUG main sailpoint.connector.SunIDMConnector:1215 - Fetching [idm3]
    idm3

If so, then things are working properly.  Since trace adds a lot of
output clutter, you may wish to disable it now and reenable it only when
something isn't working.


6) Test Aggregation

In the iiq integration console execute the command "testAggregation".  

   iiq integration
   > use "Sun IDM"
   > testAgg

This will simulate the use of
the connector in an aggregation task.  It will create an account
iterator that will bring over accounts for both the IDM system users
and all of their resource accounts.  The XML for the ResourceObjects
that would be used for the aggregation will be printed in the console.
If you left trace enabled you should see large SPML messages
containing the full IDM user view for each user.

The connector will behave as a "multiplexing" connector assigning each
set of ResourceObjects representing the accounts for an IDM user the
same multiplex id.

Execute the command "getAccount idm1" to verify that you can fetch IDM
user information one at a time.  Because the Connector.getObject
method does not support multiplexing, we will return one ResourceObject
represeing the IDM user, and inside this object will be a special
attribute named "accounts".  The value of this attribute is
a List of ResourceObjects for each linked account.  


7) Test Provisioning

If you have started with a freshly populated MySQL test database, 
there should be three users: idm1, idm2, and idm3.  Each of these
accounts has a "groups" attribute with these values:

   idm1: Group A
   idm2: Group B
   idm2: Group C

To verify your starting state issue this query in the MySQL console
or any other database browser:

   mysql -u root
   ...
   mysql> use identityiq
   mysql> select * from idm_members;
   +---------+----------+
   | user_id | group_id |
   +---------+----------+
   | idm1    | A        |
   | idm2    | B        |
   | idm3    | C        |
   +---------+----------+
   3 rows in set (0.00 sec)

The group_id column has the id of the groups which will be the
letters A-F and matches the letter in the group name.  For example
the group id of "Group A" is "A", etc.

The provisioning test files assume that the group memberships are in
this starting state.  If not you will need to execute SQL to put them
back to this state, rebuild the demo database, or modify the test
files to provision different groups.

First we will add user "idm1" to "Group B".  From the integration
console execute this command:

    iiq integration
    > use Sun
    > provision test/plan-add.xml

Run the idm_members query again to verify that there is a new row
associating idm1 with group id "B".

    +---------+----------+
    | user_id | group_id |
    +---------+----------+
    | idm1    | A        |
    | idm2    | B        |
    | idm3    | C        |
    | idm1    | B        |
    +---------+----------+
    4 rows in set (0.00 sec)

Finally execute this plan file to remove the group membership we
just added.

    provision test/plan-remove.xml


8) Debug Provisioning

If provisioning doesn't appear to be working properly, and the SPML
messages look correct, you will need to install the debugging
workflows to get a better look at what is happening.

Bring up "lh console" and import the file idmdebug.xml.  This will
install a new version of the Update User workflow named "Debug Update
Workflow", as well as other renmaed workflow subprocesses.  When
the workflow is launched there is a custom step that will dump
the XML for the user view being processed in the file c:\idmview1.xml.

Retry the provisioning request from the iiq integration console,
then look in the idmview1.xml file to see if something looks wrong.


9) Test Other Operations

If basic provisioning from step 7 is working, then the extra testing
in this step is optional since connectivity is working well enough to
send SPML requests and have them pass through the workflows.  But if
you are having trouble with any of these provisioning operations, you
can return to these simple tests to help narrow down the problem.

Run them with the "provision" command in the integration console
just like the tests in step 7.

   plan-disable.xml
   
       Disables the demo database account for user "idm1".
       The TestAdapter models disable status as a column in the
       idm_users table, use SQL to verify that the column is
       set to "true".

   plan-enable.xml

       Enables the demo database account for user "idm1".
       Use this after running plan-disable.xml to return the database
       to its starting state.  Use SQL to verify that the disabled
       column becomes null or "false".

   plan-delete.xml

      Completely deletes the demo database account for user "idm1".
      Use SQL to verify that the row from the idm_users table is gone.

   plan-create.xml
      
      Recreates the demo database account for user "idm1".
      This should be run after plan-delete.xml to put the database
      back into it's starting state.  

   plan-createuser.xml
   
      Creates a new IDM user named "idm4".  This user will not  
      have any accounts in the demo database, you'll need to 
      look at the user list in the IDM UI to verify that it was 
      created.

   plan-deleteuser.xml

      Deletes the IDM user named "idm4".  This should be run after
      plan-createuser.xml to return the database to its starting state.

   plan-setpassword.xml
   plan-setpassword2.xml

      The first plan sets the password of the "idm1" account in the
      demo database to "xyzzy", the second plan sets the password
      to "aaaa".  Use both of them to verify that the password
      can be changed and reverted.  In the demo database the
      password is stored in the "password" column.  The value
      of the password column will be encrypted so you'll need to 
      watch for the pattern changing since you can't tell what
      the current password value actually is just by looking
      at the column value.


10) Aggregate from IDM

At this point, all the operations supported by the IDM integration 
have been tested and we can now start using it with IIQ.

Bring up the iiq console and run the task "Sun IDM Aggregation".

You should see five new identities: Configurator, Administrator, 
idm1, idm2, and idm3.  THe first two are IDM internal users.
All should have a LInk to the "Sun IDM" application.  The last
three should also have a link to a new bootstrapped application 
named "IDM/IdentityIQ Integration Demo".

The bootstrapped application should have a schema that was auto-discovered.
If it doesn't check the TaskDefinition and make sure the
"updateMultiplexedSchemas" option is true.

If you need to manually create a Schema for some reason, you can paste
the one from the Application named "IDM/IdentityIQ Integration Demo - Local" 
from the iiqinit.xml file into the generated applications, or pre-create
theh applications with the desired schema.

11) Do Stuff

You can now managed accounts from IDM as you would with any other 
connector.

----------------------------------------------------------------------
