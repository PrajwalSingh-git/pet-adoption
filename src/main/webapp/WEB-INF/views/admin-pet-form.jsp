
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="includes/header.jsp" %>
<h2>${empty pet ? 'Create Pet' : 'Edit Pet'}</h2>
<c:if test="${not empty error}">
    <div class="error">${error}</div>
</c:if>
<form method="post" enctype="multipart/form-data"
      action="${empty pet ? pageContext.request.contextPath.concat('/admin/pets/new') : pageContext.request.contextPath.concat('/admin/pets/edit')}">
    <c:if test="${not empty pet}">
        <input type="hidden" name="id" value="${pet.id}" />
    </c:if>
    <label>Name: <input type="text" name="name" value="${pet.name}" required /></label>
    <label>Type:
        <select name="type">
            <option value="DOG" ${pet.type == 'DOG' ? 'selected' : ''}>Dog</option>
            <option value="CAT" ${pet.type == 'CAT' ? 'selected' : ''}>Cat</option>
            <option value="OTHER" ${pet.type == 'OTHER' ? 'selected' : ''}>Other</option>
        </select>
    </label>
    <label>Breed: <input type="text" name="breed" value="${pet.breed}" /></label>
    <label>Age (years): <input type="number" name="ageYears" value="${pet.ageYears}" min="0" /></label>
    <label>Description:
        <textarea name="description" rows="4" cols="40">${pet.description}</textarea>
    </label>
    <label>Image:
        <input type="file" name="image" />
        <c:if test="${not empty pet.imagePath}">
            <br/>Current: <img src="${pageContext.request.contextPath}/uploads/pets/${pet.imagePath}" height="80"/>
        </c:if>
    </label>
    <label>Status:
        <select name="status">
            <option value="AVAILABLE" ${pet.status == 'AVAILABLE' ? 'selected' : ''}>Available</option>
            <option value="PENDING" ${pet.status == 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="ADOPTED" ${pet.status == 'ADOPTED' ? 'selected' : ''}>Adopted</option>
        </select>
    </label>
    <button type="submit">${empty pet ? 'Create' : 'Update'}</button>
</form>
<%@ include file="includes/footer.jsp" %>
