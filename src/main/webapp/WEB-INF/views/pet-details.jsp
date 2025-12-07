
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="includes/header.jsp" %>
<h2>${pet.name}</h2>
<p>Type: ${pet.type}</p>
<p>Breed: ${pet.breed}</p>
<p>Age: ${pet.ageYears}</p>
<p>${pet.description}</p>
<c:if test="${not empty pet.imagePath}">
    <img src="${pageContext.request.contextPath}/uploads/pets/${pet.imagePath}" alt="${pet.name}" height="200"/>
</c:if>
<c:if test="${not empty error}">
    <div class="error">${error}</div>
</c:if>
<c:if test="${sessionScope.role == 'ADOPTER'}">
    <h3>Adopt this pet</h3>
    <form method="post" action="${pageContext.request.contextPath}/adopt">
        <input type="hidden" name="petId" value="${pet.id}" />
        <label>Why do you want to adopt this pet?</label>
        <textarea name="message" rows="4" cols="40"></textarea>
        <button type="submit">Submit Adoption Request</button>
    </form>
</c:if>
<%@ include file="includes/footer.jsp" %>
