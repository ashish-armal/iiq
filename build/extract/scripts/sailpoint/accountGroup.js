/* (c) Copyright 2008 SailPoint Technologies, Inc., All Rights Reserved. */
Ext.ns('SailPoint', 'SailPoint.AccountGroup');
Ext.require([
             'Ext.data.*',
             'Ext.grid.*'
         ]);

/** Scripts for the account group edit page **/

// eliminates right mouse clicks on the row
function doNothing(grid, rowIndex, event) {       
   event.stopEvent();
}

function refreshPanel(component) {
    component.getStore().load({params:{start:0, limit:20}});
}

function clickGroupRow(gridView, record, HTMLitem, index, e, eOpts) {
    Ext.getDom('editForm:id').value = record.getId();
    Ext.getDom('editForm:transitionToNewAccountGroupButton').click();
}

function onClickGroupRow(gridView, record, HTMLitem, index, e, eOpts) {
    var name = null;
    if (record.data) {
      if (record.data.nativeIdentity) {
        name = record.data.nativeIdentity;
      } else if (record.data.name) {
        name = record.data.name;
      }
    }
    if (name != null) {
      viewAccountGroup("", "", encodeURIComponent(name), record.getId());
    } else {
      viewAccountGroup("", "", "", record.getId());
    }
}

function renderAccountGroupGrid(grid, renderDiv, gridWidth) {
    if (gridWidth) {
        grid.setWidth(gridWidth);
    }
    
    grid.getStore().load({params:{start:0, pageSize:20, limit:20}});
    grid.render(Ext.getDom(renderDiv));
    grid.expand(true);
}

function reloadMetaData(changedStore, newMetaData) {
    var root = newMetaData.root;
    var gridId;
    if ( root == "members" ) {
        gridId = 'membersGrid';
    } else 
    if ( root == "inheritedGroups" ) {
        gridId = 'inheritedGroupsGrid';
    } else
    if ( root == "inheritingGroups" ) {
        gridId = 'inheritingGroupsGrid';
    } else
    if ( root == "permissions" ) {
        gridId = 'permissionsGrid';
    }

    SailPoint.Utils.setColumnFlex(newMetaData);
    SailPoint.Utils.setDecisionColClass(newMetaData);

    var columnConfig = newMetaData.columnConfig,
        i;
    for (i = 0; i < columnConfig.length; i++) {
        if (Ext.isDefined(columnConfig[i].header)) {
            columnConfig[i].header = Ext.String.htmlEncode(columnConfig[i].header);
        }
    }

    var sortInfo = [{property: newMetaData.sortColumn, direction: newMetaData.sortDirection}];
    if (!newMetaData.sortColumn) {
        sortInfo = [{property: 'name', direction: 'ASC'}];
        if ( gridId == "permisssionsGrid" ) {
            sortInfo = [{property: 'target', direction: 'ASC'}];
        }
    }
    changedStore.sorters.addAll(sortInfo);
    
    // based on the store id get the grid
    var gridPanel = Ext.getCmp(gridId);
    gridPanel.reconfigure(changedStore, newMetaData.columnConfig);
}

var accountGroupWindow;
function displayAccountGroupPopup(store, records, options) {
    var record = records[0],
        // hack, just added this property to store in viewAccountGroup
        params = store.getProxy().extraParams,
        tl = '#{msgs.dialog_group_details}',
        displayName = record.get('displayName'),
        group,
        attributes,
        standardPanel,
        groupPanel,
        permGrid,
        permissionCount,
        gridMetaData,
        membersGrid,
        memberCount,
        inheritedGrid,
        inheritedCount,
        inheritingGrid,
        inheritingCount,
        tabPanel,
        tabItems,
        recordId,
        accessCount,
        accessGrid,
        accessMetaData;

    if (accountGroupWindow && accountGroupWindow.isVisible()){
        accountGroupWindow.hide();
    }
    
    if (accountGroupWindow) {
        accountGroupWindow.destroy();
    }

    if (displayName) {
        tl =  Ext.String.htmlEncode(displayName) + ' ' + '#{msgs.dialog_group_details}';
    } else {
        group = params['groupName'];
        if (group) {
           tl = Ext.String.htmlEncode(group) + ' ' + '#{msgs.dialog_group_details}';
        }
    }

    recordId = record.get('id');
    if (Ext.isEmpty(recordId)) {
        // there is no managed attribute backing this yet so
        // there is no info to show about this one
        Ext.Msg.show({
            title: '#{msgs.acct_group_window_no_additional_info_title}',
            msg: '#{msgs.acct_group_window_no_additional_info}',
            icon: Ext.Msg.INFO,
            buttons: Ext.Msg.OK
        });

        return;
    }

    // attributes
    attributes = new Ext.Panel({
        id: 'accountGroupAttributesPanel',
        loader: {
            ajaxOptions: {
                method: 'post'
            },
            params: params,
            url: SailPoint.getRelativeUrl('/identity/viewAccountGroupWrapper.jsf'),
            autoLoad: true
        },
        bodyBorder: false
    });

    standardPanel = Ext.create('Ext.panel.Panel', {
        id: 'accountGroupStandardPanel',
        title: '#{msgs.label_standard_properties}',
        autoScroll: true,
        loader: {
            url: SailPoint.getRelativeUrl('/rest/managedAttributes/' + recordId),
            autoLoad: true,
            renderer: 'data'
        },
        tpl: new Ext.XTemplate(
          '<div class="spContent">',
            '<span class="sectionHeader">#{msgs.acct_group_window_standard}</span>',
            '<tpl for=".">',
              '<div class="spTabledContent">',
                '<table class="paddedTbl width100">',
                  '<tr><td class="titleColumn">#{msgs.acct_group_window_app}</td><td>{application}</td></tr>',
                  '<tr><td class="titleColumn">#{msgs.acct_group_window_type}</td><td>{type}</td></tr>',
                  '<tpl if="attribute != null">',
                    '<tr><td class="titleColumn">#{msgs.acct_group_window_attr}</td><td>{attribute}</td></tr>',
                  '</tpl>',
                  '<tr><td class="titleColumn">#{msgs.acct_group_window_value}</td><td>{value}</td></tr>',
                  '<tr><td class="titleColumn">#{msgs.acct_group_window_disp_value}</td><td>{displayableName:htmlEncode}</td>',
                  '<tpl if="description != null">',
                    '<tr><td class="titleColumn">#{msgs.acct_group_window_desc}</td><td>{description}</td></tr>',
                  '</tpl>',
                  '<tpl if="owner != null">',
                    '<tr><td class="titleColumn">#{msgs.acct_group_window_owner}</td><td>{owner}</td></tr>',
                  '</tpl>',
                  '<tr><td class="titleColumn">#{msgs.acct_group_window_requestable}</td><td>{requestable}</td></tr>',
                '</table>',
              '</div>',
            '</tpl>',
          '</div>',
          '<tpl if="extendedAttributes != null">',
            '<div class="spContent">',
              '<span class="sectionHeader">#{msgs.acct_group_window_extended}</span>',
              '<div class="spTabledContent">',
                '<table class="paddedTbl width100">',
                  '<tpl for="extendedAttributes">',
                    '<tr><td class="titleColumn">{key:htmlEncode}</td><td>{value}</td></tr>',
                  '</tpl>',
                '</table>',
            '</div>',
          '</tpl>'
        )
    });

    groupPanel = new Ext.Panel({
        id: 'accountGroupMainPanel',
        autoScroll: true,
        title: '#{msgs.object_properties}'
    });

    groupPanel.add(attributes);

    // only add these items if they have values in order to save real estate
    permissionCount = record.get("permissionCount");
    if (permissionCount > 0) {
        gridMetaData = Ext.decode(record.get("permissionGridMetaData"));
        permGrid = getPermissionsGrid(gridMetaData, params, 5, '#{msgs.permissions}');
        groupPanel.add(permGrid);
    }

    memberCount = record.get("memberCount");
    if (memberCount > 0) {
        membersGrid = getMembersGrid(params, 5, '#{msgs.members}');
        membersGrid.on('beforeexpand', panelExpanded);
    }

    inheritedCount = record.get("inheritedCount");
    if (inheritedCount > 0) {
        inheritedGrid = getInheritedGroupsGrid(params, 5, '#{msgs.inherited_groups}');
        inheritedGrid.on('beforeexpand', panelExpanded);
        inheritedGrid.addListener('itemclick', onClickGroupRow);
        groupPanel.add(inheritedGrid);
    }

    inheritingCount = record.get("inheritingCount");
    if (inheritingCount > 0) {
        inheritingGrid = getInheritingGroupsGrid(params, 5, '#{msgs.inheriting_groups}');
        inheritingGrid.on('beforeexpand', panelExpanded);
        inheritingGrid.addListener('itemclick', onClickGroupRow);
        groupPanel.add(inheritingGrid);
    }

    accessCount = record.get("accessCount");
    if (accessCount > 0) {
        accessMetaData = Ext.decode(record.get("accessGridMetaData"));
        accessGrid = SailPoint.AccountGroup.getAccessGrid(accessMetaData, {id: recordId}, 5, '#{msgs.access}');
    }

    tabItems = [standardPanel, groupPanel];
    if (membersGrid) {
        tabItems.push(membersGrid);
    }
    if (accessGrid) {
        tabItems.push(accessGrid);
    }

    tabPanel = Ext.create('Ext.tab.Panel', {
        id: 'accountGroupTabPanel',
        items: tabItems,
        listeners: {
            tabchange: function(tabPanel, newCard, oldCard, eOpts) {
                // load members store if necessary
                if (membersGrid && (newCard.getId() === membersGrid.getId()) &&
                    membersGrid.getStore().getCount() === 0) {

                    membersGrid.getStore().load();
                } else if (permGrid && groupPanel && (newCard.getId() === groupPanel.getId()) &&
                    permGrid.getStore().getCount() === 0) {
                    permGrid.getStore().load();
                } else if (accessGrid && (newCard.getId() === accessGrid.getId()) &&
                    accessGrid.getStore().getCount() === 0) {
                    accessGrid.getStore().load();
                }
            }
        }
    });

    accountGroupWindow = new Ext.Window({
        id: 'accountGroupPopupWindow',
        title: tl,
        width: 768,
        height: 576,
        closable : false,
        layout : 'fit',
        buttons: [{
            text: "#{msgs.button_close}",
            cls : 'secondaryBtn',
            handler: function() {
                accountGroupWindow.hide();
            }
        }],
        items: [tabPanel]
    });

    accountGroupWindow.show();

    if (permGrid) {
        // this one shows by default
        permGrid.show();
    }

    if (inheritedGrid) {
        inheritedGrid.collapse(Ext.Component.DIRECTION_TOP, false);
        inheritedGrid.show();
    }

    if (inheritingGrid) {
        inheritingGrid.collapse(Ext.Component.DIRECTION_TOP, false);
        inheritingGrid.show();
    }
}

function getInheritedGroupsGrid(params, pageSize, title) {
    var url = CONTEXT_PATH + '/define/groups/inheritedAccountGroupsDataSource.json';
    return getGroupGrid('inheritedGroups', url, "Inherited Groups", params, pageSize, title);
}

function getInheritingGroupsGrid(params, pageSize, title) {
    var url = CONTEXT_PATH + '/define/groups/inheritingAccountGroupsDataSource.json';
    return getGroupGrid('inheritingGroups', url, "Inheriting Groups",params, pageSize, title);
}

function getGroupGrid(rootId, urlPath, title, params, pageSize, title) {

    var gridId = rootId + "Grid"
    // data store
    var store = SailPoint.Store.createStore({
        model : 'SailPoint.model.Empty',
        storeId: gridId +'Store',
        url: urlPath,
        extraParams : params,
        remoteSort: true,
        pageSize: pageSize,
        listeners: {
            exception: function(proxy, store, response, e) {
                alert('error loading ' + gridId + ' grid:' + e);
            },
            metachange: reloadMetaData
        }
    });
    var grid = new SailPoint.grid.PagingGrid({
        id: gridId,
        cls: 'wrappingGridCells',
        collapsible: true,
        collapsed: true,
        titleCollapse: true,
        store: store,
        title: title,
        columns: [{header: 'name', sortable: true}],
        viewConfig : {
            stripeRows: true
        },
        loadMask: true,
        pageSize: pageSize
    });
    
    grid.on('expand', function(panel) {
      var window = Ext.getCmp('accountGroupMainPanel');
      if(window) {
        var panelTop = panel.getEl().getOffsetsTo(window.body)[1] + window.body.getScroll().top;
        window.body.scrollTo('top', panelTop);
      }
    }, this);
    return grid;
}

function getPermissionsGrid(gridMetaData, params, pageSize, title) {

    var store = SailPoint.Store.createStore({
        storeId: 'permissionsGridStore',
        root: 'permissions',
        fields: gridMetaData.fields,
        url: SailPoint.getRelativeUrl('/define/groups/permissionsDataSource.json'),
        extraParams : params,
        remoteSort: true,
        pageSize: pageSize
    });
    
    store.on('load', function() { addDescriptionTooltips(); });

    var grid = new SailPoint.grid.PagingGrid({
        id: 'permissionsGrid',
        cls:'wrappingGridCells',
        //cm: new SailPoint.grid.DynamicColumnModel(gridMetaData.columns),
        gridMetaData: gridMetaData,
        columns : gridMetaData.columns,
        collapsible: true,
        titleCollapse: true,
        store: store,
        title: title,
        shrinkWrap: false,
        height: 500,
        viewConfig: {
          scrollOffset: 1,
          stripeRows: true
        },
        loadMask: true,
        pageSize: pageSize
    });
    return grid;
}


function getMembersGrid(params, pageSize, title) {
    var store = SailPoint.Store.createStore({
        model : 'SailPoint.model.Empty',
        url: CONTEXT_PATH + '/define/groups/accountGroupMembersDataSource.json',
        extraParams : params,
        storeId: 'membersGridStore',
        remoteSort: true,
        listeners: {
            exception: function(proxy, store, response, e) {
                alert('error loading members grid:' + e);
            },
            metachange: reloadMetaData
        },
        pageSize: pageSize
    });

    var grid = new SailPoint.grid.PagingGrid({
      id: 'membersGrid',
      title: title,
      cls:'wrappingGrid',
      collapsible: true,
      titleCollapse: true,
      // Doesn't matter what our column model is because we will reconfig
      // it upon fetching the metadata
      columns: [{header: 'Name', sortable: true}],
      store: store,
      pageSize: pageSize,
      viewConfig: {
        scrollOffset: 1,
        stripeRows: true
      },
      loadMask: true
    });
    
    grid.on('expand', function(panel) {
      var window = Ext.getCmp('accountGroupMainPanel');
      if(window) {
        var panelTop = panel.getEl().getOffsetsTo(window.body)[1] + window.body.getScroll().top;  
        window.body.scrollTo('top', panelTop);
      }
    }, this);
    return grid;
}

SailPoint.AccountGroup.getAccessGrid = function(gridMetaData, params, pageSize, title) {

    var store = SailPoint.Store.createStore({
        fields: gridMetaData.fields,
        url: CONTEXT_PATH + '/define/groups/accountGroupAccessDataSource.json',
        extraParams : params,
        storeId: 'accessGridStore',
        remoteSort: true,
        root: 'objects',
        totalProperty: 'count',
        listeners: {
            exception: function(proxy, store, response, e) {
                alert('error loading access grid:' + e);
            }
        },
        pageSize: pageSize
    });

    var grid = new SailPoint.grid.PagingGrid({
        id: 'accessGrid',
        title: title,
        cls:'wrappingGrid',
        collapsible: true,
        titleCollapse: true,
        gridMetaData: gridMetaData,
        columns : gridMetaData.columns,
        store: store,
        pageSize: pageSize,
        viewConfig: {
            scrollOffset: 1,
            stripeRows: true
        },
        loadMask: true
    });

    grid.on('expand', function(panel) {
        var window = Ext.getCmp('accountGroupMainPanel');
        if(window) {
            var panelTop = panel.getEl().getOffsetsTo(window.body)[1] + window.body.getScroll().top;
            window.body.scrollTo('top', panelTop);
        }
    }, this);
    return grid;
};

SailPoint.AccountGroup.renderInheritedGroups = function(appName, referenceAttributeName, currentValue) {
    var isGroupTabEnabled = (Ext.getDom('showGroupTab').innerHTML.toLowerCase() == "true");
    var isProvisioningEnabled = (Ext.getDom('provisioningEnabled').innerHTML.toLowerCase() == "true");
    var store;
    if (isGroupTabEnabled) {
        var jsonData = Ext.decode(Ext.getDom('inheritedGroupsInit').innerHTML);
        if (isProvisioningEnabled) {
            Ext.getDom('inheritingTbl').style['position'] = 'static';
            Ext.getDom('inheritingTbl').style['width'] = '600px';
            Ext.getDom('inheritingTbl').style['border'] = '0 none white';
            Ext.getDom('inheritingTbl').className = 'x-column-header';
            var inheritedGroupsInput = new SailPoint.MultiSuggest({
                id: 'inheritedAccountGroups',
                suggestType : 'inheritedAccountGroup',
                jsonData: jsonData,
                displayField: 'displayName',
                inputFieldName: 'editForm:inheritedAccountGroupIds',
                renderTo: 'inheritingTbl',
                disabled: !isProvisioningEnabled,
                width: 600,
                comboWidth: 295,
                padSuggest: true,
                emptyText: '#{msgs.add_group}',
                extraParams: {
                    application: appName,
                    referenceAttribute: referenceAttributeName,
                    currentValue: currentValue
                },
                extraFields: [
                    'owner'
                ],
                gridOverrides: {
                    columns: [{
                        name: 'id',
                        dataIndex: 'id',
                        header: '',
                        width: 10,
                        sortable: false,
                        hideable: false,
                        menuDisabled: true,
                        renderer: function(value, p, rec, rowIndex, colIndex, store) {
                            return SailPoint.MultiSuggest.renderRemove('', p, rec, rowIndex, colIndex, store);
                        }
                    },{
                        name: 'displayField',
                        dataIndex: 'displayField',
                        header: '#{msgs.name}',
                        width: 90,
                        sortable: true
                    },{
                        name: 'owner',
                        dataIndex: 'owner',
                        property: 'owner.displayName',
                        header: '#{msgs.owner}',
                        width: 100,
                        sortable: true
                    }],
                    cls: 'wrappingGridCells',
                    loadMask: true,
                    width: 600,
                    height: this.listHeight || 128,
                    pageSize: 25,
                    autoScroll: true,
                    hideHeaders: false,
                    forceFit: true,
                    viewConfig: {                
                        scrollOffset: 1,
                        stripeRows: true
                    }
                }
            });
            
            inheritedGroupsInput.suggest.getStore().loadData(jsonData.objects);
            inheritedGroupsInput.selectedStore.loadData(jsonData.objects);            
        } else {
            var gridId = 'inheritedGroupsGrid';
            var baseHeight = new Number(Ext.getDom('numInherited').value) * 50 + 28;
            var pageSize = 10;
            
            // data store
            var store = SailPoint.Store.createStore({
                model : 'SailPoint.model.Empty',
                storeId: gridId +'Store',
                extraParams : { id: Ext.getDom('editForm:id').value },
                url: CONTEXT_PATH + '/define/groups/inheritedNameOnlyAccountGroupsDataSource.json',
                remoteSort: true,
                pageSize: pageSize,
                autoLoad: true,
                listeners: {
                    exception: function(proxy, store, response, e) {
                        alert('error loading ' + gridId + ' grid:' + e);
                    },
                    metachange: reloadMetaData
                }
            });
            
            new SailPoint.grid.PagingGrid({
                id: gridId,
                cls: 'wrappingGridCells',
                collapsible: false,
                collapsed: false,
                titleCollapse: true,
                width: 600,
                height: baseHeight > 128 ? baseHeight : 128,
                store: store,
                renderTo: 'inheritingTbl',
                columns: [{header: 'name', sortable: true}, {header: 'owner', sortable: true}],
                viewConfig : {
                    stripeRows: true,
                    columnWidth: 290
                },
                loadMask: true,
                pageSize: pageSize
            });
        }
    }
};

SailPoint.AccountGroup.renderHierarchyPanel = function() {
    new Ext.panel.Panel({
        id: 'hierarchyPanel',
        title: '#{msgs.inheritance}',
        layout: { type: 'hbox', align: 'left' },
        items: [Ext.getCmp('accountGroupHierarchyTree'), Ext.getCmp('inheritedAccountGroupsPanel')],
        collapsible: true,
        renderTo: 'inheritingTbl',
        width: 704
    });    
}


SailPoint.AccountGroup.updateReferenceAttributeSuggest = function(appName) {
    var referenceAttributeSuggest = Ext.getCmp('referenceAttributeSuggest');
    var referenceAttribute = Ext.getDom('referenceAttributeInput').value;
    var isGroup = (Ext.getDom('isGroup').innerHTML.toLowerCase() == "true");
    var typeCombo = Ext.getCmp('typeComboCmp');
    if (!referenceAttributeSuggest) {
        if (isGroup) {
           Ext.getDom('referenceAttribute').innerHTML = '<span>' + referenceAttribute + '</span>';
        } else if (!Ext.get('editForm:unboundPermissionTarget') && (!typeCombo || (typeCombo && !typeCombo.isDisabled()))) {
            Ext.getDom('referenceAttribute').innerHTML = '';
            referenceAttributeSuggest = new SailPoint.AccountAttributeSuggest({
                id: 'referenceAttributeSuggest',
                application: appName,
                jsonData: {"totalCount":0,"objects":[]},
                renderTo: 'referenceAttribute',
                binding: 'referenceAttributeInput',
                valueField: 'name',
                displayField: 'name',
                value: referenceAttribute,
                width: 300,
                listeners: {
                    select: function(combo, records, eOpts) {
                        if (this.binding) {
                            this.binding.value = records[0].data[this.valueField || this.displayField];
                        }
                    }
                }
            });            

            if (referenceAttribute.length > 0) {
                var referenceAttributeRecords = Ext.decode(Ext.getDom('referenceAttributeInit').innerHTML);
                referenceAttributeSuggest.getStore().loadData(referenceAttributeRecords.attributes);
                referenceAttributeSuggest.setValue(referenceAttribute);
            }
        }
    } else {
        referenceAttributeSuggest.clearValue();
        referenceAttributeSuggest.getStore().getProxy().extraParams['application'] = appName;
        referenceAttributeSuggest.getStore().load({ 
            params:{start: 0, limit: referenceAttributeSuggest.pageSize }
        });
    }
};

SailPoint.AccountGroup.initDescriptions = function() {
    var descrValue = Ext.getDom('editForm:managedAttributeDescription').value;
    var allowManagedAttributeLocalization = Ext.getDom("allowManagedAttributeLocalization").innerHTML;
    
    if(!descrValue) {
        descrValue = ' ';
    }

    if(Ext.getDom('managedAttributeDescriptionHTML') && Ext.getDom("managedAttributeDescriptionsJSON")) {
        Ext.create('SailPoint.MultiLanguageHtmlEditor', {
            renderTo: 'managedAttributeDescriptionHTML',
            width:500,
            height:200,
            languageJSON : Ext.getDom("managedAttributeDescriptionsJSON").innerHTML,
            id:'managedAttributeDescriptionHTMLCmp',
            value: descrValue,
            langSelectEnabled: allowManagedAttributeLocalization == "true",
            defaultLocale : Ext.getDom("manAttrdescrDefaulLocale").innerHTML
        });
    }
};

function renderTarget(value, p, r) {
    var target = r.get('target');
    var id = r.id;

    var targetTemplate = new Ext.XTemplate(
        '<tpl if="!descriptionFirst && values.description">',
            '<div style="display:inline"><span class="entitlementDescriptions" id="description_'+id+'"><span>{description}</span><img style="margin-left:5px" src="' + SailPoint.CONTEXT_PATH + '/images/icons/info.png" height="14px" width="14px"/></span>',
            '<span class="entitlementValues" id="name_'+id+'" style="display:none"><span>{name}</span><img style="margin: 0 2px 0 2px" src="' + SailPoint.CONTEXT_PATH + '/images/icons/info.png" height="14px" width="14px"/></span></div>',
        '</tpl>',
        '<tpl if="descriptionFirst && values.description">',
          '<div style="display:inline"><span class="entitlementValues" id="name_'+id+'"><span>{name}</span><img style="margin-left:5px" src="' + SailPoint.CONTEXT_PATH + '/images/icons/info.png" height="14px" width="14px"/></span>',
          '<span style="display:none" class="entitlementDescriptions" id="description_'+id+'"><span>{description}</span><img style="margin: 0 2px 0 2px" src="' + SailPoint.CONTEXT_PATH + '/images/icons/info.png" height="14px" width="14px"/></span></div>',
        '</tpl>',
        '<tpl if="!values.description">{name}</tpl>'
    );
    
    var txt = targetTemplate.apply(target);
    return Ext.String.format('{0}', txt);
};

/*Function Used Generate Pop-up to get Group Search Scope as input for LDAP Multigroup Application */
SailPoint.AccountGroup.groupScopeDefinition = function(index) {
    Ext.define('group',{
        extend: 'Ext.data.Model',
        fields: ['objectType', 'memberSearchDN', 'memberSearchFilter']
    });

    var objectType,
        scopeJ,
        serachDN,
        store = '',
        groups,
        scopeDom,
        dnDom;

    if (Ext.isDefined(index)) {
        scopeDom = 'editForm:scopeObjInfo:' + index + ':multiGroupScopeHidden';
        dnDom = 'editForm:scopeObjInfo:' + index + ':searchDN';
    } else {
        scopeDom = 'editForm:multiGroupScopeHidden';
        dnDom = 'editForm:searchDN';
    }
    
    if (Ext.isDefined(Ext.getDom('editForm:groupObjectTypes'))) {
        objectType = Ext.getDom('editForm:groupObjectTypes').value;
        groups = objectType.split('|');
    }
    if (Ext.isDefined(Ext.getDom(scopeDom)) && Ext.getDom(scopeDom) != null) {
        scopeJ = Ext.getDom(scopeDom).value;
        scopeJ = scopeJ.replace(/\\n/g,'\\n').replace(/\r\n/g,'\\r\\n').replace(/\n/g,'\\r\\n').replace(/\r\r/g,'\\r');
    }
    if (Ext.isDefined(Ext.getDom(dnDom)) && Ext.getDom(dnDom) != null) {
        serachDN = Ext.getDom(dnDom).value;
    }

    if (!Ext.isDefined(eval(scopeJ)) && Ext.isDefined(objectType)) {
         var data = '[';

         Ext.each(groups, function (obj) {
             if (obj) {
                  data = data + '{"objectType":"' + obj + '","memberSearchDN":"","memberSearchFilter":""},';
              }
         });
         
         if (data.length > 1) {
             data = data.substr(0,data.length-1) + ']';
         } else {
             data = data + "]";
         }
         store = eval(data);
    } else if (Ext.isDefined(objectType)) {
        var extra ='',
            prefix = '\'objectType\':\'',
            suffix = '\'';

        Ext.each(groups, function (obj) {
            if (obj && (scopeJ.indexOf(prefix+obj+suffix)<0)) {
                extra = extra + ',{"objectType":"'+obj+'","memberSearchDN":"","memberSearchFilter":""}';
            }
        });
        
        if (extra.length > 0) {
            scopeJ = scopeJ.substr(0,scopeJ.length-1) + extra  +']';
        }
         store = eval(scopeJ);
    }

    var ScopeStore = Ext.create('Ext.data.Store', {
        model: 'group',
        storeId:'groupSearchStore',
        id: 'groupStore',
        fields: ['objectType', 'memberSearchDN', 'memberSearchFilter'],
        data: store,
        proxy: {
            type: 'memory',
            reader: {
                type: 'json',
                idProperty: 'group'
            }
        },
        autoSync: true,
        autoLoad: true
    });

    var groupScopeGrid = Ext.create('Ext.grid.Panel', {
        id: 'groupGrid',
        cls : 'groupScopeGrid',
        bodyStyle: 'background-color:#EEEEEE;',
        style: 'background-color:#EEEEEE',
        store: ScopeStore,
        columns: [
            {
                text: "#{msgs.con_form_ldap_groupType}",
                dataIndex: 'objectType',
                sortable: false,
                menuDisabled: true,
                minWidth: 150,
                resizable: false
            },
            {
                text: "#{msgs.con_form_ldap_grp_mbr_srch_dn}",
                dataIndex: 'memberSearchDN',
                sortable: false,
                minWidth: 400,
                resizable: false,
                menuDisabled: true,
                editor: {
                    xtype: 'textareafield',
                    allowBlank: true,
                    height:40,
                    autoScroll : true,
                },
                renderer: function(value, metaData) {
                    metaData.style = "border: 1px gray solid;white-space:pre-wrap;";
                    return value;
                }
            },
            {
                text: "#{msgs.con_form_ldap_grp_mbr_srch_filter}",
                dataIndex: 'memberSearchFilter',
                sortable: false,
                minWidth: 400,
                resizable: false,
                menuDisabled: true,
                editor: {
                    xtype: 'textfield',
                    height:40,
                    allowBlank: true
                },
                renderer: function(value, metaData) {
                    metaData.style = "border: 1px gray solid;";
                    return value;
                }
            } 
        ],
        selType: 'cellmodel',
        plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            })
        ]
    });

 Ext.create('Ext.window.Window', {
        id: 'main',
        resizable: false,
        modal : true,
        minWidth: 900,
        title: "#{msgs.con_form_ldap_popup_title}" + serachDN,
        items: [groupScopeGrid],
        buttons: [{
            text: "#{msgs.button_save}",
            cls: 'primaryBtn',
            scale : 'medium',
            handler: function() {
                var count = ScopeStore.getCount()-1,
                    datavalue = ScopeStore.data.getRange(0,count),
                    finalGrpScope = '[';

                Ext.each(datavalue, function (obj) {
                    var searchDN = obj.get('memberSearchDN').replace(/\\n/g,'\\\\n').replace(/\n/g,'\\r\\n').replace(/\r\n/g,'\\r\\n');
                    finalGrpScope = finalGrpScope + '{\'objectType\':\''+obj.get('objectType')+'\',\'memberSearchDN\':\''+searchDN+'\',\'memberSearchFilter\':\''+obj.get('memberSearchFilter')+'\'},';
                });

                finalGrpScope = finalGrpScope.substring(0, finalGrpScope.length - 1) + ']';
                
                Ext.getDom(scopeDom).value = finalGrpScope;
                
                ScopeStore.commitChanges();
                Ext.ComponentManager.get('groupGrid').saveState();
                Ext.getCmp('main').close();
            }
        }]
    }).show();
};