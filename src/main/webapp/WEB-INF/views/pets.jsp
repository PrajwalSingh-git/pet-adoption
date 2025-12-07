
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="includes/header.jsp" %>
<h2>Available Pets</h2>
<c:if test="${not empty param.success}">
    <div class="success">Adoption request submitted successfully!</div>
</c:if>
<form method="get" action="${pageContext.request.contextPath}/pets">
    <label>Search: <input type="text" name="q" value="${param.q}" /></label>
    <label>Type:
        <select name="type">
            <option value="">Any</option>
            <option value="DOG" ${param.type == 'DOG' ? 'selected' : ''}>Dog</option>
            <option value="CAT" ${param.type == 'CAT' ? 'selected' : ''}>Cat</option>
            <option value="OTHER" ${param.type == 'OTHER' ? 'selected' : ''}>Other</option>
        </select>
    </label>
    <label>Breed: <input type="text" name="breed" value="${param.breed}" /></label>
    <label>Age Min: <input type="number" name="ageMin" value="${param.ageMin}" /></label>
    <label>Age Max: <input type="number" name="ageMax" value="${param.ageMax}" /></label>
    <button type="submit">Apply Filters</button>
</form>
<c:if test="${empty pets}">
    <p>No pets match your criteria.</p>
</c:if>
<ul>
    <c:forEach var="pet" items="${pets}">
        <li>
            <strong>${pet.name}</strong> (${pet.type}) - ${pet.breed} - ${pet.ageYears} years
            <c:if test="${not empty pet.imagePath}">
                <br/>
                <img src="${pageContext.request.contextPath}/uploads/pets/${pet.imagePath}" alt="${pet.name}" height="80"/>
            </c:if>
            <br/>
            <a href="${pageContext.request.contextPath}/pet?id=${pet.id}">View details</a>
        </li>
    </c:forEach>
</ul>
<div class="pagination">
    <c:if test="${page > 0}">
        <a href="${pageContext.request.contextPath}/pets?page=${page-1}&size=${size}&q=${param.q}&type=${param.type}&breed=${param.breed}&ageMin=${param.ageMin}&ageMax=${param.ageMax}">Previous</a>
    </c:if>
    <span>Page ${page + 1}</span>
    <c:if test="${hasNext}">
        <a href="${pageContext.request.contextPath}/pets?page=${page+1}&size=${size}&q=${param.q}&type=${param.type}&breed=${param.breed}&ageMin=${param.ageMin}&ageMax=${param.ageMax}">Next</a>
    </c:if>
</div>
<%@ include file="includes/footer.jsp" %>
