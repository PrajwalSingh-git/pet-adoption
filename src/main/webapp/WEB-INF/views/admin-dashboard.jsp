
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ include file="includes/header.jsp" %>
<h2>Admin Dashboard</h2>
<p><a href="${pageContext.request.contextPath}/admin/pets/new">Add New Pet</a></p>
<h3>Pending Adoption Requests</h3>
<c:if test="${empty pendingRequests}">
    <p>No pending requests.</p>
</c:if>
<c:if test="${not empty pendingRequests}">
    <table>
        <thead>
        <tr>
            <th>ID</th>
            <th>Pet ID</th>
            <th>Adopter ID</th>
            <th>Message</th>
            <th>Requested At</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <c:forEach var="req" items="${pendingRequests}">
            <tr>
                <td>${req.id}</td>
                <td>${req.petId}</td>
                <td>${req.adopterId}</td>
                <td>${req.message}</td>
                <td>${req.requestedAt}</td>
                <td>
                    <a href="${pageContext.request.contextPath}/admin/approve?id=${req.id}">Approve</a> |
                    <a href="${pageContext.request.contextPath}/admin/reject?id=${req.id}">Reject</a>
                </td>
            </tr>
        </c:forEach>
        </tbody>
    </table>
</c:if>
<h3>Manage Pets</h3>
<c:if test="${empty pets}">
    <p>No pets in system.</p>
</c:if>
<c:if test="${not empty pets}">
    <table>
        <thead>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Breed</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <c:forEach var="pet" items="${pets}">
            <tr>
                <td>${pet.id}</td>
                <td>${pet.name}</td>
                <td>${pet.type}</td>
                <td>${pet.breed}</td>
                <td>${pet.status}</td>
                <td>
                    <a href="${pageContext.request.contextPath}/admin/pets/edit?id=${pet.id}">Edit</a> |
                    <a href="${pageContext.request.contextPath}/admin/pets/delete?id=${pet.id}">Delete</a>
                </td>
            </tr>
        </c:forEach>
        </tbody>
    </table>
</c:if>
<%@ include file="includes/footer.jsp" %>
