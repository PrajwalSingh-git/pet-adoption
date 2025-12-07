
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="includes/header.jsp" %>
<h2>Error</h2>
<p>${empty message ? 'Something went wrong.' : message}</p>
<%@ include file="includes/footer.jsp" %>
