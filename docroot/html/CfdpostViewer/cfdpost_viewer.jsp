<%@page import="com.kisti.osp.util.OSPVisualizerUtil"%>
<%@page import="com.kisti.osp.util.OSPVisualizerConfig"%>
<%@page import="com.kisti.osp.constants.OSPRepositoryTypes"%>
<%@page import="com.liferay.portal.kernel.util.GetterUtil"%>
<%@page import="com.liferay.portal.util.PortalUtil"%>
<%@page import="com.liferay.portal.kernel.portlet.LiferayWindowState"%>
<%@page import="javax.portlet.PortletPreferences"%>
<%@include file="../init.jsp"%>

<portlet:resourceURL var="serveResourceURL"></portlet:resourceURL>
<%
OSPVisualizerConfig visualizerConfig = OSPVisualizerUtil.getVisualizerConfig(renderRequest, portletDisplay, user);
%>

<div class="container-fluid osp-visualizer" style="padding: 0px;!important">
		<iframe 
				class="col-sm-12 osp-iframe-canvas iframe-canvas"  
				style="<%=visualizerConfig.getDisplayStyle()%> border:0;padding:0;" 
				id="<portlet:namespace/>canvas" 
				src="<%=request.getContextPath()%>/html/CfdpostViewer/inner-viewer.jsp">
		</iframe>
</div>

<!--
<script src="<%=request.getContextPath()%>/js/d3/d3.v5.min.js"></script>
-->
<script src="<%=request.getContextPath()%>/js/post/post.js"></script>
<script>
/***********************************************************************
 * Global variables and initialization section
 ***********************************************************************/
 var <portlet:namespace/>canvas = document.getElementById('<portlet:namespace/>canvas');

 var <portlet:namespace/>config = {
			namespace: '<portlet:namespace/>',
			displayCanvas: <portlet:namespace/>canvas,
			portletId: '<%=portletDisplay.getId()%>',
			connector: '<%=visualizerConfig.connector%>',
			menuOptions: JSON.parse('<%=visualizerConfig.menuOptions%>'), 
			resourceURL: '<%=serveResourceURL%>',
			eventHandlers: {
					'OSP_LOAD_DATA': <portlet:namespace/>loadDataEventHandler,
					'OSP_RESPONSE_DATA':<portlet:namespace/>responseDataEventHandler,
					'OSP_INITIALIZE': <portlet:namespace/>initializeEventHandler
			},
			loadCanvas: <portlet:namespace/>loadCFDPOST,
			procFuncs:{
				readServerFile: function( jsonData ){
					console.log('Custom function for readServerFile....');
				}
			}
};
 
 var <portlet:namespace/>visualizer;
 $('#<portlet:namespace/>canvas').load( function(){
	<portlet:namespace/>visualizer = OSP.Visualizer(<portlet:namespace/>config);
	<portlet:namespace/>processInitAction( JSON.parse( '<%=visualizerConfig.initData%>' ) );
 });

var <portlet:namespace/>regularString;
var <portlet:namespace/>filelist;
var <portlet:namespace/>jsonData;
var <portlet:namespace/>rltData = new Array();
/***********************************************************************
 * Canvas functions
***********************************************************************/
function <portlet:namespace/>loadCFDPOST( jsonData, changeAlert ){	
	switch( jsonData.type_ ){
	case OSP.Enumeration.PathType.FILE:
			<portlet:namespace/>regularString = new RegExp(jsonData.name_);
			console.log(<portlet:namespace/>regularString);
			<portlet:namespace/>jsonData = jsonData;
	    <portlet:namespace/>visualizer.getFolderInfo( jsonData.parent_, '' );
		break;
	case OSP.Enumeration.PathType.FOLDER:
	case OSP.Enumeration.PathType.EXT:
			<portlet:namespace/>regularString = new RegExp("result_....rlt");
			console.log(<portlet:namespace/>regularString);
			<portlet:namespace/>jsonData = jsonData;
	    <portlet:namespace/>visualizer.getFolderInfo( jsonData.parent_, '' );
		break;
	case OSP.Enumeration.PathType.CONTENT:
	case OSP.Enumeration.PathType.FOLDER_CONTENT:
		console.log(jsonData);
		<portlet:namespace/>filelist = jsonData.content_.map( (d) => { if(d.name.match(<portlet:namespace/>regularString)){ return d.name };}).filter(item => item);
		for (const file of <portlet:namespace/>filelist) {
			var dummyJson = <portlet:namespace/>jsonData;
			dummyJson.name_ = file;
			<portlet:namespace/>visualizer.readServerFile(dummyJson);
		}
		break;
	case OSP.Enumeration.PathType.FILE_CONTENT:
//		<portlet:namespace/>rltData.push( new CFDData(jsonData.content_) );
		<portlet:namespace/>rltData.push( jsonData.content_ );

		if (<portlet:namespace/>rltData.length == <portlet:namespace/>filelist.length) {
			<portlet:namespace/>visualizer.callIframeFunc( 'drawContour', null, <portlet:namespace/>rltData );
		}
		break;
	default:
		alert('Un supported yet.');
	}
}

function <portlet:namespace/>setTitle( title ){
	var titleSplit = title.split(".job/");
	if(titleSplit.length > 1 ) {
		var title = "./" + titleSplit[1];
		title = title.replace("//","/");
	}
	$('#<portlet:namespace/>title').html( '<h4 style="margin:0;">'+title+'</h4>' );
}

function <portlet:namespace/>processInitAction( jsonInitData ){
	if( jsonInitData && !jsonInitData.repositoryType_ ){
		// Do nothing if repository is not specified.
		// This means processInitAction will be performed OSP_SHAKEHAND event handler.
		return;  
	}
	
	if( !jsonInitData.user_ ){	
		jsonInitData.user_ = '<%=user.getScreenName()%>';
		jsonInitData.dataType_ = {
				name: 'any',
				version:'0.0.0'
		};
		jsonInitData.type_ = OSP.Enumeration.PathType.FOLDER;
		jsonInitData.parent_ = '';
		jsonInitData.name_ = '';
	}
	
	<portlet:namespace/>visualizer.processInitAction( jsonInitData, false );
}

/***********************************************************************
 * Window Event binding functions 
 ***********************************************************************/
$('#<portlet:namespace/>openLocalFile').click(function(){
	<portlet:namespace/>visualizer.openLocalFile();
});

$('#<portlet:namespace/>openServerFile').click(function(){
	<portlet:namespace/>visualizer.openServerFile();
});

$('#<portlet:namespace/>download').click(function(){
	<portlet:namespace/>visualizer.downloadCurrentFile();
});

/***********************************************************************
 * Handling OSP Events and event handlers
 ***********************************************************************/
function <portlet:namespace/>loadDataEventHandler( data, params ){
	console.log('[<portlet:namespace/>loadDataEventHandler] ', data );
	
	<portlet:namespace/>visualizer.loadCanvas( data, false );
}

function <portlet:namespace/>responseDataEventHandler( data, params ){
	console.log('[<portlet:namespace/>responseDataEventHandler]', data, params);
	
	switch( params.procFunc ){
	case 'readServerFile':
		<portlet:namespace/>visualizer.runProcFuncs( 'readServerFile', data );
		break;
	}
}

function <portlet:namespace/>initializeEventHandler( data, params ){
	console.log('[<portlet:namespace/>initializeEventHandler] ', Liferay.PortletDisplay );
	
	<portlet:namespace/>visualizer.callIframeFunc('cleanCanvas', null );
	<portlet:namespace/>visualizer.processInitAction( null, false );
}
</script>

