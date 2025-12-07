
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="includes/header.jsp" %>
<h2>Register</h2>
<c:if test="${not empty error}">
    <div class="error">${error}</div>
</c:if>
<form method="post" action="${pageContext.request.contextPath}/register">
    <label>Full Name: <input type="text" name="fullName" required /></label>
    <label>Email: <input type="email" name="email" required /></label>
    <label>Password: <input type="password" name="password" required /></label>
    <button type="submit">Register</button>
</form>
<%@ include file="includes/footer.jsp" %>
