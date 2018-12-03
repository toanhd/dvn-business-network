/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Sample transaction
 * @param {org.dvn.com.Grading} Grading
 * @transaction
 */
async function Grading(GradingTx) {
    //Action type
    let action = '';
    //create format for transcript id
    let transcriptID = "transcript_" + GradingTx.student.StudentID;
    //Asset Registry for object type Transcript
    let transcriptReg = await getAssetRegistry('org.dvn.com.Transcript');
    //check existence of transcript
    let avail = await transcriptReg.exists(transcriptID);
    //Get Factory to create new resource
    let factory = getFactory();
    //Asset Registry for object type Grade
    let gradeReg = await getAssetRegistry('org.dvn.com.Grade');
    if (avail) { //this student transcript is exist
        var transcript = await transcriptReg.get(transcriptID);

        //Create new Grade
        let gradeID = transcriptID + "grade_" + (transcript.grades.length() + 1);
        let newGrade = factory.newResource('org.dvn.com', 'Grade', gradeID.toString());
        newGrade.IssueDate = GradingTx.timestampt;
        newGrade.CourseID = GradingTx.CourseID;
        newGrade.CourseName = GradingTx.CourseName;
        newGrade.Credit = GradingTx.Credit;
        newGrade.GradeVal = GradingTx.GradeVal;

        //Create relationship
        newGrade.lecturer = factory.newRelationship('org.dvn.com', 'Lecturer', GradingTx.lecturer.LecturerID);
        //Update grade to grade registry
        await gradeReg.add(newGrade);

        //Save new grade to transcript
        transcript.addArrayValue('grades', newGrade);
        //Update transcript to transcript registry
        await gradeReg.update(transcript);
    } else { //this student transcript is not exist
        //Create new Transcript
        let newTranscript = factory.newResource('org.dvn.com', 'Transcript', transcriptID);
        //Tao relationship cho doi tuong reference
        newTranscript.student = factory.newRelationship('org.dvn.com', 'Student', GradingTx.student.StudentID);

        //Create new Grade
        let gradeID = transcriptID + "grade_" + (transcript.grades.length() + 1);
        let newGrade = factory.newResource('org.dvn.com', 'Grade', gradeID.toString());
        newGrade.IssueDate = GradingTx.timestampt;
        newGrade.CourseID = GradingTx.CourseID;
        newGrade.CourseName = GradingTx.CourseName;
        newGrade.Credit = GradingTx.Credit;
        newGrade.GradeVal = GradingTx.GradeVal;

        //Create relationship
        newGrade.lecturer = factory.newRelationship('org.dvn.com', 'Lecturer', GradingTx.lecturer.LecturerID);
        //Update grade to grade registry
        await gradeReg.add(newGrade);

        //Save new grade to transcript
        transcript.addArrayValue('grades', newGrade);
        //Update transcript to transcript registry
        await gradeReg.update(transcript);
    }
    //Create new event
    let GradingEvent = factory.newEvent('org.dvn.com', 'GradingEvent');
    GradingEvent.GradingTransaction = GradingTx;
    GradingEvent.action = action;
    //Emit event
    emit(GradingEvent);
}
