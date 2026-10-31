package com.virat.job.service;

import com.virat.job.dto.request.AddApplicationNoteRequest;
import com.virat.job.dto.response.ApplicationNoteResponse;

import java.util.List;

public interface ApplicationNoteService {

    ApplicationNoteResponse addNote(Long applicationId, Long employerId, AddApplicationNoteRequest req) throws Exception;

    List<ApplicationNoteResponse> getNotesByApplication(Long applicationId, Long employerId) throws Exception;

    void deleteNote(Long noteId, Long applicationId, Long employerId) throws Exception;
}
