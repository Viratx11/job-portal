package com.virat.job.service.impl;

import com.virat.job.dto.request.AddApplicationNoteRequest;
import com.virat.job.dto.response.ApplicationNoteResponse;
import com.virat.job.event.ApplicationEventPublisher;
import com.virat.job.mapper.ApplicationMapper;
import com.virat.job.modal.ApplicationNote;
import com.virat.job.modal.JobApplication;
import com.virat.job.repository.ApplicationNoteRepository;
import com.virat.job.service.ApplicationNoteService;
import com.virat.job.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationNoteServiceImpl implements ApplicationNoteService {

    private final ApplicationNoteRepository noteRepository;
    private final ApplicationService applicationService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public ApplicationNoteResponse addNote(Long applicationId, Long employerId, AddApplicationNoteRequest req) throws Exception {
        JobApplication application = applicationService.getApplicationEntity(applicationId);
        assertEmployer(application, employerId);

        ApplicationNote note = ApplicationNote.builder()
                .application(application)
                .addedByUserId(employerId)
                .content(req.getContent())
                .build();

        ApplicationNoteResponse response = ApplicationMapper.toNoteResponse(noteRepository.save(note));
        eventPublisher.publishNoteAdded(application);
        return response;
    }

    @Override
    public List<ApplicationNoteResponse> getNotesByApplication(Long applicationId, Long employerId) throws Exception {
        JobApplication application = applicationService.getApplicationEntity(applicationId);
        assertEmployer(application, employerId);

        return noteRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId)
                .stream().map(ApplicationMapper::toNoteResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteNote(Long noteId, Long applicationId, Long employerId) throws Exception {
        JobApplication application = applicationService.getApplicationEntity(applicationId);
        assertEmployer(application, employerId);

        ApplicationNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new Exception("Note not found with id: " + noteId));

        if (!note.getApplication().getId().equals(applicationId)) {
            throw new Exception("Note does not belong to application with id: " + applicationId);
        }

        noteRepository.delete(note);
    }

    private void assertEmployer(JobApplication application, Long employerId) throws Exception {
        if (!application.getEmployerId().equals(employerId)) {
            throw new Exception("You are not the employer for this application");
        }
    }
}
