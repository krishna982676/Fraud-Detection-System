package com.frauddetection.controller;

import com.frauddetection.service.DatasetAnalysisService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/datasets")
public class DatasetController {
    private final DatasetAnalysisService service;

    public DatasetController(DatasetAnalysisService service) { this.service = service; }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(service.upload(file));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list() { return ResponseEntity.ok(service.list()); }

    @GetMapping("/{id}/profile")
    public ResponseEntity<Map<String, Object>> profile(@PathVariable String id) { return ResponseEntity.ok(service.profile(id)); }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<Map<String, Object>> analyze(@PathVariable String id) { return ResponseEntity.ok(service.analyze(id)); }

    @GetMapping("/{id}/results")
    public ResponseEntity<Map<String, Object>> results(@PathVariable String id) { return ResponseEntity.ok(service.analyze(id)); }

    @GetMapping("/{id}/export")
    public ResponseEntity<ByteArrayResource> export(@PathVariable String id) {
        byte[] bytes = service.export(id).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"analysed-" + id + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(bytes.length)
                .body(new ByteArrayResource(bytes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
