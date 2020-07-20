<!-- 
SailPoint Technologies
Authors: JC Will & Kelly Grizzle

ITIM SubForm to check role SoD violatons in IIQ. 

This form reads from the parent form to get the list of current organizational
roles and person name.  After this data is read, it posts back to itself to
perform the policy check.
-->

<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="java.util.List" %>

<%@ page import="sailpoint.itim.PolicyChecker" %>

<%!
/**
 * Return the string representation of any SoD violations for the current user
 * with their current roles.  This is called on the second pass when the page is
 * posted back.
 *
 * @param  request  The HttpServlet request to get parameters from.
 */
private String policyCheck(HttpServletRequest request) throws ServletException {

    String result = null;

    // Gets roles that were stuck in the form on the first pass.
    String tmpRoles = (String) request.getParameter("roles");
    
    // Splits the roles and converts them into a list.
    String[] rolesArray = tmpRoles.split(";");
    List roles = new ArrayList();
    if (null != rolesArray) {
        for (int i=0; i<rolesArray.length; i++) {
            if (!"".equals(rolesArray[i].trim())) {
                roles.add(rolesArray[i]);
            }
        }
    }

    // Gets the user name that was stuck in the form on the first pass.
    String user = (String) request.getParameter("formUser");
    
    try {
        PolicyChecker checker = new PolicyChecker();
        List violations = checker.checkRolePoliciesByNamesOrDNs(user, roles);

        if ((null == violations) || violations.isEmpty()) {
            result = "No Policy Violation detected";
        }
        else {
            result = "";
            String sep = "";
            for (Iterator it=violations.iterator(); it.hasNext(); ) {
                result += sep + it.next();
                sep = ", ";
            }
        }
    }
    catch (Exception e) {
        e.printStackTrace();
        result = "Error contacting IIQ.";
    }

    return result;
}
%>

<%
// If we haven't yet pulled the roles and user name out of the opening form,
// we need to do so and then post back to this page to run the policy check.
// The formUser parameter will not be present on the first pass.
String user = request.getParameter("formUser");
boolean isFirstPass = (null == user);
%>

<html>
<HEAD>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1" %>
<META http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<META http-equiv="Content-Style-Type" content="text/css">
<link title="Styles" type="text/css" href="en/Styles.css" rel="stylesheet">
<style type="text/css">
    body { direction: inherit } 
    .matchDir { text-align: left }  
    .mismatchDir { text-align: right }  
</style>
<script language="JavaScript" src="script_library.js"></script>
<script language="JavaScript">

/**
 * Return an array with all sub-elements of the given parent element that have
 * the given tag name and elementName.
 *
 * @param  pareentElt   The parent element in which to search.
 * @param  tagName      The tag name of the element to look for.
 * @param  elementName  The name of the elements to retrieve.
 *
 * @return A non-null array with the all sub-elements of the given parent
 *         element that have the given tag name and element name.
 */
function getElementsByName(parentElt, tagName, elementName) {
    var found = new Array();

    var elements = parentElt.getElementsByTagName(tagName);
    if (null != elements) {
        for (var i=0; i<elements.length; i++) {
            if (('undefined' != elements[i]['name']) && (elementName === elements[i].name)) {
                found.push(elements[i]);
            }
        }
    }

    return found;
}

/**
 * Might this be a DN?  Use a sophisticated algorithm to find out.
 */
function looksLikeADNSmellsLikeADN(isItADN) {
    // Quite lame ... just look for an equals sign.  Good enough for what we need.
    return (null != isItADN) && (isItADN.indexOf('=') > -1);
}

/**
 * Grab the person's name and roles from the parent form, stick them into this
 * form and post back to this page to perform the role violation check.
 */
function roleCheckPostback() {
    // Grab the role names out of the opening form.
    var roles = '';
    var sep = '';

    // The roles can be in one of two places:
    //
    //  1) In a set of hidden fields if the role check subform is not on the
    //     same tab as the role select widget.
    //  2) In the options of a select box if the role check subform is on the
    //     same tab as the role select widget.
    //
    // We'll first look for hidden fields and then look for the select box if
    // we don't find those.
    var roleDNs = getElementsByName(window.opener.document, 'input', 'multiple.data.erroles');
    if (roleDNs.length > 0) {
        for (var i = 0; i<roleDNs.length; i++) {
            roles += sep + roleDNs[i].value;
            sep = ';';
        }
    }
    else {
        var roleSelects = getElementsByName(window.opener.document, 'select', 'multiple.data.erroles');
        if (roleSelects.length == 1) {
            var roleSelect = roleSelects[0];
            for (var i = 0; i<roleSelect.options.length; i++) {

                // ITIM 5.0 stores list indexes in the select box rather than
                // DNs (ITIM 4.6 uses DNs).  If this isn't a DN (ie - it is an
                // index), grab the name of the role from the option text and
                // use it instead.
                var currentRole = roleSelect.options[i].value;
                if (!looksLikeADNSmellsLikeADN(currentRole)) {
                    currentRole = roleSelect.options[i].text;
                }

                roles += sep + currentRole;
                sep = ';';
            }
        }
    }
    document.getElementById('roles').value = roles;

    // Grab the user name out of the opening form.
    var cns = getElementsByName(window.opener.document, 'input', 'data.cn');
    var userName = cns[0].value;
    document.getElementById('formUser').value = userName;
    
    // Post the role check form now that we've pulled the data out of the
    // opening form with javascript.
    document.forms['roleCheckForm'].submit();
}
</script>
</head>


<body onload="<%= (isFirstPass) ? "roleCheckPostback();" : "" %>" marginheight="0" marginwidth="0" rightmargin="0" topmargin="0" leftmargin="0">
  <form method="POST" name="roleCheckForm" id="roleCheckForm" action="checkiiqroles.jsp">
    <!-- This comes custom from the subform -->
    <input value="" name="roles" id="roles" type="hidden">
    <input value="" name="formUser" id="formUser" type="hidden">
  </form>

<!-- THE ACTUAL CONTENT -->
<table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0" name="containerTable">
<tr>
<td valign="top">
<table cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td class="copyright">&nbsp;</td>
</tr>
<tr>
<td bgcolor="cccc99" height="9" width="100%"><img border="0" height="9" width="1" src="images/pixel.gif"><br><b>&nbsp; IdentityIQ SOD Check</b><br><br></td>
</tr>
</table>
<table border="0" width="100%" cellspacing="0" cellpadding="7" class="path">
<tr>
<td class="content">Check<%= (isFirstPass) ? "ing" : "ed" %> roles with IdentityIQ for any violations.</td>
</tr>
</table>

<table align="center" bordercolordark="white" bordercolor="lightgrey" width="95%" border="1" cellspacing="0" cellpadding="1">
<tr>
<br>
<td nowrap="true" class="gridcell" align="center"><b class="formlabel">Status:</b></td><td class="gridcell matchDir"><b class="formlabel">

<!-- Print either a waiting message on the first pass, or the policy violation status on the second pass. -->
<%= (isFirstPass) ? "Checking for role violations in SailPoint IdentityIIQ..." : policyCheck(request) %>

</b></td></td>
</tr>
<tr>

</tr>
<table align="center" cellspacing="0" cellpadding="1" width="95%" border="0">
<tr>
<td>

<a href="javascript:done()" onmouseover="document.images['buttondone'].src='en/images/buttondone_f2.gif';" onmouseout="document.images['buttondone'].src='en/images/buttondone.gif';"><img vspace="8" hspace="8" name="buttondone" border="0" title="" alt="" src="en/images/buttondone.gif"></a>
</td>
</tr>

</table>

<table border="0" width="100%">
<tr>
<td class="matchDir"></td>
</tr>
</table>
</td>
</tr>
<tr>
<td valign="bottom">
<table cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td bgcolor="cccc99" height="9" width="100%"><img border="0" height="9" width="1" src="images/pixel.gif"></td>
</tr>
<tr>
<td class="copyright">SailPoint Technologies&nbsp;</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
