/* (c) Copyright 2008 SailPoint Technologies, Inc., All Rights Reserved. */

Ext.ns('SailPoint', 
       'SailPoint.Syslog', 
       'SailPoint.Syslog.Search',
       'SailPoint.Analyze', 
       'SailPoint.Analyze.Syslog');

SailPoint.Syslog.Search.getSyslogSearchPanel = function(config) {
    var activeItem = 'syslogSearchContents';
    if (config.activeCard) {
        activeItem = config.activeCard;
    }
    
    var searchContents = Ext.create('Ext.panel.Panel', {
        id: 'syslogSearchContents',
        layout: 'fit',
        contentEl: 'syslogSearchContentsDiv',
        border: false,
        autoScroll: true,
        bbar: [{
            id: 'preSyslogSearchBtn',
            text: '#{msgs.button_run_search}',
            cls : 'primaryBtn',
            handler: function() {
                var searchPanel = Ext.getCmp('syslogSearchPanel');
                searchPanel.validationErrors = SailPoint.Analyze.validateSearch('syslogSearchForm', 'syslog'); 
            }
        }, {
            id: 'syslogClearBtn',
            text: '#{msgs.button_clear_search}',
            handler: function() {
                Ext.getDom('syslogSearchForm:resetBtn').click()
            }
        }],
        loader: {
            url: SailPoint.getRelativeUrl('/analyze/syslog/syslogSearchContents.jsf'),
            params: { searchType: 'Syslog' },
            discardUrl: false,
            callback: SailPoint.Syslog.Search.finishInit,
            nocache: false,
            text: '#{msgs.loading_data}',
            timeout: 30,
            scripts: true
        }
    });

    var resultsContents = SailPoint.Search.getResultsGrid({
        id: 'syslogSearchResultsGrid',
        type: 'Syslog',
        stateful: true,
        stateId: SailPoint.Analyze.gridStateIds.get('Syslog'),        
        url: SailPoint.getRelativeUrl('/analyze/syslog/syslogDataSource.json'),
        handleClick: SailPoint.Syslog.Search.handleClick,
        pageSize: SailPoint.Analyze.defaultResultsPageSize,
        optionsPlugin: SailPoint.Search.getOptionsPlugin({
            searchType: 'Syslog',
            cardPanelId: 'syslogSearchPanel',
            searchPanelId: 'syslogSearchContents',
            applySearchPanelStyles: SailPoint.Syslog.Search.styleSearchPanels,
            options: [
                   ['saveOrUpdate', '#{msgs.save_search}'],
                   ['saveAsReport', '#{msgs.save_search_as_report}']
            ]
        })
    });
        
    resultsContents.on('afterlayout', function(contentPanel, layout) {
        SailPoint.Syslog.Search.styleResultsGrid();
    });
        
    var searchPanel = Ext.create('Ext.panel.Panel', {
        id: config.id,
        title: config.title,
        headerAsText: false,
        header: false,
        layout: 'card',
        activeItem: activeItem,
        items: [searchContents, resultsContents]
    });
    
    searchPanel.on('activate', function(viewerPanel) {
        if (!searchPanel.isLoaded) {
            searchContents.getLoader().load();
            
            SailPoint.Syslog.Search.initResultsGrid();
            searchPanel.isLoaded = true;
        }
    },{
        single: true,
        scope: this
    });
    
    return searchPanel;
};

SailPoint.Syslog.Search.displaySearchResults = function() {
    var searchPanel = Ext.getCmp('syslogSearchPanel');
    searchPanel.getLayout().setActiveItem('syslogSearchResultsGridWrapper');
    searchPanel.doLayout();
    if (Ext.isGecko) {
    	Ext.getCmp('syslogSearchResultsGrid').getView().refresh();
    }
    Ext.MessageBox.hide();
    // We're not keeping track of the card panel anymore
    // Ext.getDom('stateForm:searchType').value = 'Syslog';
    // Ext.getDom('stateForm:currentCardPanel').value = 'syslogSearchResultsGrid';
    // Ext.getDom('stateForm:updatePanelStateBtn').click();
}

SailPoint.Syslog.Search.initResultsGrid = function() {
    SailPoint.BaseGrid.initGrid(SailPoint.getRelativeUrl('/analyze/syslog/syslogDataSource.json'), 'syslogSearchResultsGrid', 13, true);
};

SailPoint.Syslog.Search.styleResultsGrid = function() {
    var gridPanel = Ext.getCmp('syslogSearchResultsGrid');
    if (gridPanel) {
        var referenceDiv = Ext.get('example-grid');
        if (referenceDiv) {
            var gridWidth = referenceDiv.getWidth(true) - 20;
            gridPanel.setWidth(gridWidth);
            gridPanel.getPositionEl().applyStyles({
                'margin-left': '10px',
                'margin-right': '10px',
                'margin-bottom': '10px'
            });
        }    
    }
};

SailPoint.Syslog.Search.finishInit = function() {
    SailPoint.Analyze.Syslog.initializeAttributes();
    var accordion = Ext.getCmp('syslogFieldsAccordion');
    if (!accordion) {
        var syslogFields = [];
        if (Ext.get('syslogFieldsTab')) {
            syslogFields.push(Ext.create('Ext.panel.Panel', {
                id: 'syslogFieldsPanel',
                collapsible: false,
                hideCollapseTool: true,
                contentEl: 'syslogFieldsTab',
                title: '#{msgs.syslog_fields}'
            }));
        }
    
        accordion = Ext.create('Ext.panel.Panel', {
            id: 'syslogFieldsAccordion',
            layout: {
            	type: 'accordion',
                titleCollapse: false,
                fill: false
            },
            renderTo: 'syslogFieldAccordionDiv',
            items: syslogFields
        });
    }

    SailPoint.Syslog.Search.styleSearchPanels();
    
    // Cache the stupid tomahawk calendar values so that we can manually reset them later 
    var i = 0;
    var monthOptions = Ext.dom.Query.select('option', 'syslogSearchForm:syslogStartDate.month');
    var selectedMonth;
    for (i = 0; i < monthOptions.length; ++i) {
        if (monthOptions[i].selected === true) {
            selectedMonth = monthOptions[i].value;
        }
    }
    
    SailPoint.Syslog.startDateInit = {
        day: Ext.getDom('syslogSearchForm:syslogStartDate.day').value,
        month: selectedMonth,
        year: Ext.getDom('syslogSearchForm:syslogStartDate.year').value
    };

    monthOptions = Ext.DomQuery.select('option', 'syslogSearchForm:syslogEndDate.month');
    for (i = 0; i < monthOptions.length; ++i) {
        if (monthOptions[i].selected === true) {
            selectedMonth = monthOptions[i].value;
        }
    }

    SailPoint.Syslog.endDateInit = {
        day: Ext.getDom('syslogSearchForm:syslogEndDate.day').value,
        month: selectedMonth,
        year: Ext.getDom('syslogSearchForm:syslogEndDate.year').value
    };

    buildTooltips(Ext.getDom('syslogSearchCriteria'));
    
    var submitOnEnter = new SailPoint.SubmitOnEnter("preSyslogSearchBtn");
    var textFields = document.getElementsByClassName('searchInputText','attributes');
    Ext.each(textFields, function (textField) {
        submitOnEnter.registerTextField(textField);
    });
    
    SailPoint.Analyze.registerSubmits({
        className: 'searchInputText',
        container: Ext.getDom('syslogSearchCriteria'),
        eventHandler: SailPoint.Analyze.submitEventHandler,
        options: {
            formName: 'syslogSearchForm',
            searchType: 'Syslog'
        }
    });
    
    Ext.MessageBox.hide();
}

SailPoint.Syslog.Search.styleSearchPanels = function() {
    resizeTables('syslogSearchForm');
    Ext.getCmp('syslogSearchContents').doLayout();
    Ext.getCmp('syslogFieldsAccordion').doLayout();
}


SailPoint.Syslog.Search.clearSearchFields = function() {
    var formName = 'syslogSearchForm';
    
    if (Ext.getDom('syslogStartDateSelect')) {
        Ext.getDom('syslogStartDateSelect').checked = false;
        Ext.getDom('syslogStartDateDiv').style['display'] = 'none';
        Ext.getDom(formName + ':syslogStartDateType').value = 'None';
    }
    
    if (Ext.getDom('syslogEndDateSelect')) {
        Ext.getDom('syslogEndDateSelect').checked = false;
        Ext.getDom('syslogEndDateDiv').style['display'] = 'none';
        Ext.getDom(formName + ':syslogEndDateType').value = 'None';
    }
    
    Ext.getDom('quickKey').value = '';
    
    var syslogLevelSuggest = Ext.getCmp('syslogLevelSuggestCmp');
    if (syslogLevelSuggest) {
      syslogLevelSuggest.clearValue();
    }
    SailPoint.Analyze.resetSuggestAttribute('eventLevel');

    var syslogServerSuggest = Ext.getCmp('syslogServerSuggestCmp');
    if (syslogServerSuggest) {
        syslogServerSuggest.clearValue();
    }
    SailPoint.Analyze.resetSuggestAttribute('server');

    var syslogClassnameSuggest = Ext.getCmp('syslogClassnameSuggestCmp');
    if (syslogClassnameSuggest) {
        syslogClassnameSuggest.clearValue();
    }
    SailPoint.Analyze.resetSuggestAttribute('classname');

    var syslogUsernameSuggest = Ext.getCmp('syslogUsernameSuggestCmp');
    if (syslogUsernameSuggest) {
        syslogUsernameSuggest.clearValue();
    }
    SailPoint.Analyze.resetSuggestAttribute('username');

    Ext.getDom('message').value = '';

    SailPoint.Analyze.resetFieldsToDisplay('syslog');
    SailPoint.Analyze.Syslog.finishRerender();
}


SailPoint.Syslog.Search.handleClick = function(gridView, record, HTMLitem, index, e, eOpts){
    if (!SailPoint.Syslog.Search.SyslogEventDetails){
        SailPoint.Syslog.Search.SyslogEventDetails = new Ext.Window({
            title: '#{msgs.syslog_event_details}',
            modal: true,
            shim: true,
            autoScroll: true,
            resizable: true,
            shadow: false,
            width: 600,
            maxHeight: 600,
            style: 'background-color: white',
            loader: {
                url: CONTEXT_PATH + "/analyze/syslog/syslogEventDetailsDialog.jsf", 
                callback: function() { 
                    SailPoint.Syslog.Search.SyslogEventDetails.center();               
                    SailPoint.Syslog.Search.SyslogEventDetails.show();
                }
            },
            onEsc: function() { this.hide(); },
            closeAction: 'hide',
            buttonAlign: 'center',
            buttons: [
                new Ext.Button({
                    text: '#{msgs.button_close}',
                    cls : 'secondaryBtn',
                    handler: function() { SailPoint.Syslog.Search.SyslogEventDetails.hide(); }
                })
            ]
        });
    }
    
    SailPoint.Syslog.Search.SyslogEventDetails.getLoader().load({params: {id: record.getId()}});
};
 
/** 
 * 
 * ANALYZE STUFF 
 * 
 * **/
SailPoint.Analyze.Syslog.validateSearch = function(formName) {
    var errors = [];
    var isValid = true;
    
    var startDate = Ext.getDom('syslogStartDateSelect');
    var endDate = Ext.getDom('syslogEndDateSelect');
    /** Validate Dates **/
    if(startDate.checked) {
        isValid &= Validator.validateInputDate(formName+':syslogStartDate', '');
    }
    if(endDate.checked) {
        isValid &= Validator.validateInputDate(formName+':syslogEndDate', '');
    }
    
    if(startDate.checked && endDate.checked) {
        isValid &= Validator.validateStartEndDates(formName+':syslogStartDate', formName+':syslogEndDate', '#{msgs.err_invalid_start_end_date}')
    }

    if(!isValid) {
        errors = Validator.getErrors();
        Validator.clearErrors();
    }

    return errors;
}

SailPoint.Analyze.Syslog.initializeAttributes = function() {
    var checkBox = Ext.getDom('syslogStartDateSelect');
    if(Ext.getDom('syslogSearchForm:syslogStartDateType').value != 'None') {
        checkBox.checked = true;
    }
    toggleDisplay(Ext.getDom('syslogStartDateDiv'), !(checkBox.checked));
        
    var checkBox2 = Ext.getDom('syslogEndDateSelect');
    if(Ext.getDom('syslogSearchForm:syslogEndDateType').value != 'None') {
        checkBox2.checked = true;
    }
    toggleDisplay(Ext.getDom('syslogEndDateDiv'), !(checkBox2.checked));
    
    var syslogLevelSuggest = Ext.getCmp('syslogLevelSuggestCmp');
    var syslogLevelVal = Ext.getDom('eventLevelVal').innerHTML;
    
    if (syslogLevelSuggest) {
        syslogLevelSuggest.destroy();
    }    
    syslogLevelSuggest = new SailPoint.DistinctRestSuggest({
        id: 'syslogLevelSuggestCmp',
        renderTo: 'eventLevelSuggest',
        binding: 'eventLevel',
        value: syslogLevelVal,
        valueField: 'displayName',
        width: 200,
        freeText: true,
        className: 'SyslogEvent',
        column: 'eventLevel',
        listConfig: {
        	width: 300
        }
    });
    
    if(null != syslogLevelVal && syslogLevelVal != ''){
        syslogLevelSuggest.setRawValue(syslogLevelVal);
    }

    var syslogServerSuggest = Ext.getCmp('syslogServerSuggestCmp');
    var syslogServerVal = Ext.getDom('serverVal').innerHTML;
    
    if (syslogServerSuggest) {
        syslogServerSuggest.destroy();
    }    
    syslogServerSuggest = new SailPoint.DistinctRestSuggest({
        id: 'syslogServerSuggestCmp',
        renderTo: 'serverSuggest',
        binding: 'server',
        value: syslogServerVal,
        valueField: 'displayName',
        width: 200,
        freeText: true,
        className: 'SyslogEvent',
        column: 'server',
        listConfig: {
        	width: 300
        }
    });
    
    if(null != syslogServerVal && syslogServerVal != ''){
        syslogServerSuggest.setRawValue(syslogServerVal);
    }

    var syslogUsernameSuggest = Ext.getCmp('syslogUsernameSuggestCmp');
    var syslogUsernameVal = Ext.getDom('usernameVal').innerHTML;
    
    if (syslogUsernameSuggest) {
            syslogUsernameSuggest.destroy();
    }    
    syslogUsernameSuggest = new SailPoint.DistinctRestSuggest({
        id: 'syslogUsernameSuggestCmp',
        renderTo: 'usernameSuggest',
        binding: 'username',
        value: syslogUsernameVal,
        valueField: 'displayName',
        width: 200,
        freeText: true,
        className: 'SyslogEvent',
        column: 'username',
        listConfig: {
        	width: 300
        }
    });
    
    var syslogClassnameSuggest = Ext.getCmp('syslogClassnameSuggestCmp');
    var syslogClassnameVal = Ext.getDom('classnameVal').innerHTML;
    
    if (syslogClassnameSuggest) {
            syslogClassnameSuggest.destroy();
    }    
    syslogClassnameSuggest = new SailPoint.DistinctRestSuggest({
        id: 'syslogClassnameSuggestCmp',
        renderTo: 'classnameSuggest',
        binding: 'classname',
        value: syslogClassnameVal,
        valueField: 'displayName',
        width: 200,
        freeText: true,
        className: 'SyslogEvent',
        column: 'classname',
        listConfig: {
        	width: 300
        }
    });

    SailPoint.Analyze.initializeSubmit('syslogSearchForm', 'preSyslogSearchBtn');
}

SailPoint.Analyze.Syslog.finishRerender = function() {
    resizeTables('syslogSearchForm');
    SailPoint.Analyze.Syslog.initializeAttributes();
}
