const studentdb = require("../model/studentSchema");
const teacherdb = require("../model/teacherSchema");
const projectdb = require("../model/projectSchema");
const likesdb = require("../model/likesSchema");

exports.getData = async (req, res) => {
    // Logic for fetching Student data
    try {
        const studentId = req.params.userId;
        const student = await studentdb.findOne({ studentId });
    
        if (!student) {
          res.status(404).json({ error: "Student not found" });
          return;
        }
    
        res.status(200).json(student);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
};

exports.updateData = async (req, res) => {
    // Logic for updating Student data
    try {
        const studentId = req.params.userId;
        const { name, idNumber, degree, firstDegree, secondDegree, cg } = req.body;
    
        const updatedStudent = await studentdb.findOneAndUpdate(
          { studentId },
          { name, idNumber, degree, firstDegree, secondDegree, cg },
          { new: true }
        );
    
        if (!updatedStudent) {
          res.status(404).json({ error: "Student not found" });
          return;
        }
    
        res.status(200).json(updatedStudent);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
};

exports.getProjectsData = async (req, res) => {
  try {
    // Fetch all projects from projects collection
    const projects = await projectdb.find();

    // Fetch all teachers from teachers collection
    const teachers = await teacherdb.find();

    // Fetch student details based on userId from URL
    const { userId } = req.params;

    const student = await studentdb.findOne({ studentId: userId });
    if (!student) {
      // Handle the case where student is not found
      console.error('Student not found part 1');
      res.status(404).json({ message: 'Student not found' });
      return; // Exit the function early
  }
    // Format the data as required
    const projectBankData = projects.map(project => {
        // Find teacher details for the project
        const teacher = teachers.find(teacher => teacher.teacherId === project.teacherId);

        // Check eligibility based on student's cg
        const cgEligibility = parseFloat(student.cg) >= parseFloat(project.cg_cutoff) ? 'Eligible' : 'Not Eligible';

        return {
            projectId: project._id,
            project_name: project.project_name,
            project_description: project.project_description,
            project_type: project.project_type,
            project_domain: project.project_domain,
            teacher_name: teacher ? teacher.name : 'Unknown',
            department: teacher ? teacher.department : 'Unknown',
            pre_requisites: project.pre_requisites,
            cg_cutoff: project.cg_cutoff,
            cg_eligibility: cgEligibility
        };
    });

    res.json(projectBankData);
} catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
}
};

exports.getLikedProjects = async(req, res) => {
  const { studentId } = req.params;
    try {
        const student = await likesdb.findOne({ studentId });
        if (!student) {
            res.status(404).json({ message: 'Student not found part 2' });
            return;
        }
        res.status(200).json(student.likedProjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.saveLikedProjects = async(req, res) => {
  const { studentId, projectId } = req.params;
    try {
        let student = await likesdb.findOne({ studentId });
        if (!student) {
            student = new likesdb({ studentId, likedProjects: [{ projectId }] });
        } else {
            student.likedProjects.push({ projectId });
        }
        await student.save();
        res.status(200).json({ message: 'Liked project saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deleteLikedProjects = async(req, res) => {
  const { studentId, projectId } = req.params;
    try {
        let student = await likesdb.findOne({ studentId });
        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }
        student.likedProjects = student.likedProjects.filter(project => project.projectId !== projectId);
        await student.save();
        res.status(200).json({ message: 'Liked project removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// POST /saveDraft endpoint
exports.saveDrafts = async (req, res) => {
  const { studentId, projectId, projectName, projectDescription, whyWantToDoProject, currentCGPA, selectedPrerequisites } = req.body;
  
  try {
    // Find the student document
    const student = await studentdb.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
  
    // Check if a draft with the same projectId exists for the student
    const existingDraftIndex = student.drafts.findIndex((draft) => draft.projectId === projectId);
  
    if (existingDraftIndex !== -1) {
      // Update the existing draft
      student.drafts[existingDraftIndex] = {
        projectId,
        projectName,
        projectDescription,
        reason_to_do_project: whyWantToDoProject,
        current_cgpa: currentCGPA,
        pre_requisites_fulfilled: selectedPrerequisites,
      };
    } else {
      // Save the draft
      const draft = {
        projectId,
        projectName,
        projectDescription,
        reason_to_do_project: whyWantToDoProject,
        current_cgpa: currentCGPA,
        pre_requisites_fulfilled: selectedPrerequisites,
      };
      
      // Add the draft to the drafts array
      student.drafts.push(draft);
    }
  
    // Save the student document
    await student.save();
  
    res.status(200).json({ message: 'Draft saved successfully' });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getDraftDetails = async (req, res) => {
  const { studentId, projectId } = req.params;

  try {
    const student = await studentdb.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find the draft details for the specified project
    const draft = student.drafts.find((draft) => draft.projectId === projectId);

    res.status(200).json(draft);
  } catch (error) {
    console.error('Error fetching draft details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
