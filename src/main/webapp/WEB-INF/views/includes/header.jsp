<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pet Adoption</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/styles.css">
</head>
<body>
<header>
    <h1>Pet Adoption</h1>
    <nav>
        <a href="${pageContext.request.contextPath}/pets">Home</a>
        <c:if test="${empty sessionScope.loggedInUser}">
            <a href="${pageContext.request.contextPath}/login">Login</a>
            <a href="${pageContext.request.contextPath}/register">Register</a>
        </c:if>
        <c:if test="${not empty sessionScope.loggedInUser}">
            <a href="${pageContext.request.contextPath}/logout">Logout</a>
            <c:if test="${sessionScope.role == 'ADMIN'}">
                <a href="${pageContext.request.contextPath}/admin">Admin</a>
            </c:if>
        </c:if>
    </nav>
</header>
<main>
