
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="includes/header.jsp" %>
<h2>Login</h2>
<c:if test="${not empty error}">
    <div class="error">${error}</div>
</c:if>
<form method="post" action="${pageContext.request.contextPath}/login">
    <label>Email: <input type="email" name="email" required /></label>
    <label>Password: <input type="password" name="password" required /></label>
    <button type="submit">Login</button>
</form>
<%@ include file="includes/footer.jsp" %>
