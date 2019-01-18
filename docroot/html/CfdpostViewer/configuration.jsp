<%@page import="com.kisti.osp.constants.OSPRepositoryTypes"%>
<%@page import="com.liferay.portal.kernel.util.Constants"%>
<%@page import="com.liferay.portal.kernel.util.StringPool"%>
<%@page import="com.liferay.portal.kernel.util.GetterUtil"%>
<%@ include file="../init.jsp" %>


<%  
String portletWidth = GetterUtil.getString(portletPreferences.getValue("portletWidth", "100%"));
String portletHeight = GetterUtil.getString(portletPreferences.getValue("portletHeight", "400px"));
String portletScroll = GetterUtil.getString(portletPreferences.getValue("portletScroll", "hidden"));
boolean menu = GetterUtil.getBoolean(portletPreferences.getValue("menu", "true"));
boolean sample = GetterUtil.getBoolean(portletPreferences.getValue("sample", "true"));
boolean openLocalFile = GetterUtil.getBoolean(portletPreferences.getValue("openLocalFile", "true"));
boolean openServerFile = GetterUtil.getBoolean(portletPreferences.getValue("openServerFile", "true"));
boolean save = GetterUtil.getBoolean(portletPreferences.getValue("save", "true"));
boolean saveAtLocal = GetterUtil.getBoolean(portletPreferences.getValue("saveAtLocal", "true"));
boolean download = GetterUtil.getBoolean(portletPreferences.getValue("download", "true"));
boolean upload = GetterUtil.getBoolean(portletPreferences.getValue("upload", "true"));
boolean hidden = portletScroll.equals("hidden");
boolean auto = portletScroll.equals("auto");

String portletRepository = GetterUtil.getString(portletPreferences.getValue("portletRepository", OSPRepositoryTypes.USER_HOME.toString()));
%>

<liferay-portlet:actionURL portletConfiguration="true" var="configurationURL" />
<aui:form action="<%= configurationURL %>" method="post" name="fm">
    <aui:input name="<%= Constants.CMD %>" type="hidden" value="<%= Constants.UPDATE %>" />

    <!-- Preference control goes here -->
    <div class="container-fluid">
    	<div class="row-fluid">
    		<div class="col-sm-6">
    			<fieldset>
    				<legend>Portlet Size</legend>
			    	<div class="row-fluid">
			    		<div class="col-sm-6">
						    <aui:input label="Portlet Width:" name="preferences--portletWidth--" type="text" value="<%= portletWidth %>" />
						</div>
			    		<div class="col-sm-6">
						    <aui:input label="Portlet Height:"  name="preferences--portletHeight--" type="text" value="<%= portletHeight %>" />
			    		</div>
			    	</div>
			    </fieldset>
		    	<br>
		    	<div class="row-fluid">
		    		<div class="col-sm-6">
		    			<fieldset>
		    				<legend>Scrolls</legend>
						    <aui:select label="Portlet Scroll:" name="preferences--portletScroll--">
						    	<aui:option value="hidden" selected="<%=hidden %>">hidden</aui:option>
						    	<aui:option value="auto" selected="<%=auto %>">auto</aui:option>
						    </aui:select>
		    			</fieldset>
				    </div>
				</div>
		    	<br>
    		</div>
    		<div class="col-sm-6">
    			<fieldset>
    				<legend>Show Menu</legend>
	    				<aui:input type="checkbox" name="preferences--menu--" value="<%=menu%>" label="Menu"/>
    				<div style="border:solid grey 1px;">
    					<aui:input type="checkbox" name="preferences--sample--" value="<%=sample%>" label="Sample"/>
    					<aui:input type="checkbox" name="preferences--openLocalFile--" value="<%=openLocalFile%>" label="Open Local File"/>
    					<aui:input type="checkbox" name="preferences--openServerFile--" value="<%=openServerFile%>" label="Open Server File"/>
	    				<aui:input type="checkbox" name="preferences--save--" value="<%=save%>" label="Save At Server"/>
	    				<aui:input type="checkbox" name="preferences--saveAtLocal--" value="<%=saveAtLocal%>" label="Save At Local"/>
	    				<aui:input type="checkbox" name="preferences--download--" value="<%=download%>" label="Download"/>
	    				<aui:input type="checkbox" name="preferences--upload--" value="<%=upload%>" label="Upload"/>
    				</div>
    			</fieldset>
    			<br>
    		</div>
    	</div>
    	<div class="row-fluid">
    		<div class="col-sm-6">
    			<fieldset id="fieldset">
    				<legend>Repository</legend>
    				<aui:select label="Portlet Repository" name="preferences--portletRepository--">
						<aui:option value="<%= OSPRepositoryTypes.USER_HOME.toString() %>"
												 selected="<%=portletRepository.equals(OSPRepositoryTypes.USER_HOME.toString()) %>">User Home</aui:option>
						<aui:option value="<%= OSPRepositoryTypes.USER_JOBS.toString() %>"
												 selected="<%=portletRepository.equals(OSPRepositoryTypes.USER_JOBS.toString()) %>">User Jobs</aui:option>
					</aui:select>
    			</fieldset>
    		</div>
    	</div>
    	<div class="row-fluid">
    		<div class="col-sm-12 text-center">
		        <aui:button type="submit" value="Save" class="btn btn-primaryl"/>
    		</div>
    	</div>
    </div>
</aui:form>
</script>