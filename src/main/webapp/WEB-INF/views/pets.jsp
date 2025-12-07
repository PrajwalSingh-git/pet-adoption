<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="includes/header.jsp" %>

<h2>Available Pets</h2>

<c:if test="${not empty param.success}">
    <div class="success">Adoption request submitted successfully!</div>
</c:if>

<form method="get" action="${pageContext.request.contextPath}/pets">
    <input type="text" name="q" placeholder="Search by name..." value="${param.q}" />
    <button type="submit">Search</button>
</form>

<c:if test="${empty pets}">
    <p>No pets available at the moment.</p>
</c:if>

<ul>
    <c:forEach var="pet" items="${pets}">
        <li>
            <strong>${pet.name}</strong>
            (${pet.type}) - ${pet.breed} - ${pet.ageYears} years
            <a href="${pageContext.request.contextPath}/pet?id=${pet.id}">View details</a>
        </li>
    </c:forEach>
</ul>

<%@ include file="includes/footer.jsp" %>
