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
    let transcriptID = "transcript_" + GradingTx.stdMemberID;
    //Asset Registry for object type Transcript
    let transcriptReg = await getAssetRegistry('org.dvn.com.Transcript');
    //check existence of transcript
    let availTranscript = await transcriptReg.exists(transcriptID);

    //Asset Registry for object type Student
    let studentReg = await getParticipantRegistry('org.dvn.com.Student');
    //check existence of student
    let availStd = await studentReg.exists(GradingTx.stdMemberID);

    //Asset Registry for object type Lecturer
    let lecReg = await getParticipantRegistry('org.dvn.com.Lecturer');
    //check existence of student
    let availLec = await lecReg.exists(GradingTx.lecMemberID);

    //Get Factory to create new resource
    let factory = getFactory();

    //Asset Registry for object type Grade
    let gradeReg = await getAssetRegistry('org.dvn.com.Grade');

    if (availStd && availLec) {
        if (availTranscript) {
            var transcript = await transcriptReg.get(transcriptID);

            //Create new Grade
            let gradeID = transcriptID + "grade_" + (transcript.gradesList.length + 1);
            let newGrade = factory.newResource('org.dvn.com', 'Grade', gradeID.toString());
            newGrade.issueDate = GradingTx.timestamp;
            newGrade.courseID = GradingTx.courseID;
            newGrade.courseName = GradingTx.courseName;
            newGrade.credit = GradingTx.credit;
            newGrade.gradeVal = GradingTx.gradeVal;
            newGrade.semester = GradingTx.semester;

            //Create relationship
            newGrade.lecturer = factory.newRelationship('org.dvn.com', 'Lecturer', GradingTx.lecMemberID);
            //newGrade.student = factory.newRelationship('org.dvn.com', 'Student', GradingTx.stdMemberID);

            //Update grade to grade registry
            await gradeReg.add(newGrade);

            //Save new grade to transcript
            transcript.gradesList.push(newGrade);

            //Update transcript to transcript registry
            await transcriptReg.update(transcript);

        } else { //this student transcript is not exist
            //Create new Transcript
            let newTranscript = factory.newResource('org.dvn.com', 'Transcript', transcriptID);
            //Tao relationship cho doi tuong reference
            newTranscript.student = factory.newRelationship('org.dvn.com', 'Student', GradingTx.stdMemberID);
            newTranscript.gradesList = [];

            //Create new Grade
            let gradeID = transcriptID + "grade_" + (newTranscript.gradesList.length + 1);
            let newGrade = factory.newResource('org.dvn.com', 'Grade', gradeID.toString());
            newGrade.issueDate = GradingTx.timestamp;
            newGrade.courseID = GradingTx.courseID;
            newGrade.courseName = GradingTx.courseName;
            newGrade.credit = GradingTx.credit;
            newGrade.gradeVal = GradingTx.gradeVal;
            newGrade.semester = GradingTx.semester;

            //Create relationship
            newGrade.lecturer = factory.newRelationship('org.dvn.com', 'Lecturer', GradingTx.lecMemberID);
            //newGrade.student = factory.newRelationship('org.dvn.com', 'Student', GradingTx.stdMemberID);

            //Update grade to grade registry
            await gradeReg.add(newGrade);

            //Save new grade to transcript
            newTranscript.gradesList.push(newGrade);

            //add transcript to transcript registry
            await transcriptReg.add(newTranscript);

        }
        //Create new event
        let GradingEvent = factory.newEvent('org.dvn.com', 'GradingEvent');
        GradingEvent.gradingTransaction = GradingTx;
        GradingEvent.action = action;
        //Emit event
        emit(GradingEvent);
    } else {
        console.log("availLec: " + availLec)
        console.log("availStd: " + availStd)
    }
}
