import React, { useState, useEffect } from "react";
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CInputGroup,
  CContainer,
  CRow,
  CCol,
  CBadge,
  CCloseButton,
} from "@coreui/react";

const badge_styling = {
  "--bs-badge-font-size": "0.9em",
  "--bs-badge-font-weight": "500",
  "--bs-badge-color": "#18640c",
  backgroundColor: "#DAFFCB",
};

function EditModal({ projectId, closeModal }) {
  const [validated, setValidated] = useState(false);
  const [projectData, setProjectData] = useState({
    projectName: "",
    projectDescription: "",
    projectType: "",
    cgpaCutoff: "",
    projectDomain: "",
    prerequisites: [],
    newPrerequisite: "",
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/projectdata/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project data");
        }
        const data = await response.json();
        console.log("Fetched project data:", data); // Log the fetched data
        setProjectData({
          projectName: data.project.project_name,
          projectDescription: data.project.project_description,
          projectType: data.project.project_type,
          cgpaCutoff: data.project.cg_cutoff,
          projectDomain: data.project.project_domain,
          prerequisites: data.project.pre_requisites,
          newPrerequisite: "",
        });
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSaveProject = async (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setValidated(true); // Set validated state to true to trigger validation feedback
      return; // Stop further execution
    }
    setValidated(false);
    try {
      const response = await fetch(
        `http://localhost:8000/updateProject/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...projectData, // Include projectData
            projectId: projectId, // Include projectId
          }),
        }
      );
      const responseData = await response.json();
      // Map the response data to match the frontend state
      const updatedProjectData = {
        projectName: responseData.project_name,
        projectDescription: responseData.project_description,
        projectType: responseData.project_type,
        cgpaCutoff: responseData.cg_cutoff,
        projectDomain: responseData.project_domain,
        prerequisites: responseData.pre_requisites,
        newPrerequisite: "",
      };
      console.log("Project updated successfully:", updatedProjectData);
      // Update the frontend state with the updated project data
      setProjectData(updatedProjectData);
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleAddPrerequisite = () => {
    setProjectData((prevState) => ({
      ...prevState,
      prerequisites: [...prevState.prerequisites, projectData.newPrerequisite], // Use projectData directly here
      newPrerequisite: "", // Clear the newPrerequisite field after adding
    }));
  };

  const handleDeletePrerequisite = (index) => {
    setProjectData((prevState) => ({
      ...prevState,
      prerequisites: prevState.prerequisites.filter((_, i) => i !== index),
    }));
  };

  return (
    <CModal
      backdrop="static"
      visible={true}
      onClose={closeModal}
      aria-labelledby="EditModalLabel"
    >
      <CModalHeader closeButton>
        <CModalTitle id="EditModalLabel">Edit Project</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSaveProject}
        >
          <CContainer>
            <CRow>
              <CCol>
                <CFormInput
                  type="text"
                  value={projectData.projectName || ""}
                  onChange={(e) =>
                    setProjectData((prevState) => ({
                      ...prevState,
                      projectName: e.target.value,
                    }))
                  }
                  floatingLabel="Project Name"
                  feedbackInvalid="Please enter Project Name"
                  required
                />
              </CCol>
              <CCol xs={6}>
                <CFormTextarea
                  floatingLabel="Project Description"
                  value={projectData.projectDescription || ""}
                  onChange={(e) =>
                    setProjectData((prevState) => ({
                      ...prevState,
                      projectDescription: e.target.value,
                    }))
                  }
                  feedbackInvalid="Please enter Project Description"
                  required
                />
              </CCol>
            </CRow>
            <br></br>
            <CRow>
              <CCol>
                <CFormSelect
                  floatingLabel="Project Type"
                  value={projectData.projectType || ""}
                  onChange={(e) =>
                    setProjectData((prevState) => ({
                      ...prevState,
                      projectType: e.target.value,
                    }))
                  }
                  options={[
                    "Select",
                    { label: "Design Project (DOP)", value: "DOP" },
                    { label: "Label Project (LOP)", value: "LOP" },
                    { label: "Study Project (SOP)", value: "SOP" },
                  ]}
                />
              </CCol>
              <CCol>
                <CFormSelect
                  floatingLabel="CGPA cutoff"
                  value={projectData.cgpaCutoff || ""}
                  onChange={(e) =>
                    setProjectData((prevState) => ({
                      ...prevState,
                      cgpaCutoff: e.target.value,
                    }))
                  }
                  options={[
                    "Select",
                    { label: "6.0 or More", value: "6.0" },
                    { label: "7.0 or More", value: "7.0" },
                    { label: "8.0 or More", value: "8.0" },
                    { label: "9.0 or More", value: "9.0" },
                  ]}
                />
              </CCol>
            </CRow>
            <br></br>
            <CFormInput
              type="text"
              floatingLabel="Specify Domain"
              value={projectData.projectDomain || ""}
              onChange={(e) =>
                setProjectData((prevState) => ({
                  ...prevState,
                  projectDomain: e.target.value,
                }))
              }
            />
            <br></br>
            <CInputGroup className="mb-3">
              <CFormInput
                type="text"
                value={projectData.newPrerequisite || ""}
                onChange={(e) =>
                  setProjectData((prevState) => ({
                    ...prevState,
                    newPrerequisite: e.target.value,
                  }))
                }
                floatingLabel="Pre-requisites (if any)"
                aria-describedby="button-addon2"
              />
              <CButton
                type="button"
                color="secondary"
                variant="outline"
                id="button-addon2"
                onClick={handleAddPrerequisite}
              >
                Add New
              </CButton>
            </CInputGroup>
            <ul>
              {projectData.prerequisites &&
                projectData.prerequisites.map((item, index) => (
                  <CBadge
                    key={index}
                    shape="rounded-pill"
                    style={badge_styling}
                  >
                    {item}
                    <CCloseButton
                      type="button"
                      color="light"
                      style={{ width: "0.4em", height: "0.4em" }}
                      onClick={() => handleDeletePrerequisite(index)}
                    />
                  </CBadge>
                ))}
            </ul>
          </CContainer>
          <CModalFooter>
            <CButton color="secondary" onClick={closeModal}>
              Close
            </CButton>
            <CButton color="primary" type="submit">
              Save changes
            </CButton>
          </CModalFooter>
        </CForm>
      </CModalBody>
    </CModal>
  );
}

export default EditModal;
