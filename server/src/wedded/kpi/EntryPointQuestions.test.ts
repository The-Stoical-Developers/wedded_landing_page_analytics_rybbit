/**
 * Entry Point Questions Unit Tests
 */

import { describe, it, expect } from "vitest";
import {
  AVAILABLE_ENTRY_POINT_QUESTIONS,
  DEFAULT_ENTRY_POINT_QUESTION_IDS,
  getQuestionsByIds,
  getQuestionById,
  type EntryPointQuestion,
} from "./EntryPointQuestions.js";

describe("EntryPointQuestions", () => {
  describe("AVAILABLE_ENTRY_POINT_QUESTIONS", () => {
    it("should have required properties for each question", () => {
      AVAILABLE_ENTRY_POINT_QUESTIONS.forEach((question) => {
        expect(question.id).toBeDefined();
        expect(question.label).toBeDefined();
        expect(question.phase).toBeDefined();
        expect(question.bookedResponse).toBeDefined();
      });
    });

    it("should have unique IDs", () => {
      const ids = AVAILABLE_ENTRY_POINT_QUESTIONS.map((q) => q.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should only have valid phase values", () => {
      const validPhases = ["PHASE_CEREMONY", "PHASE_CELEBRATION"];
      AVAILABLE_ENTRY_POINT_QUESTIONS.forEach((question) => {
        expect(validPhases).toContain(question.phase);
      });
    });

    it("should include ceremony phase questions", () => {
      const ceremonyQuestions = AVAILABLE_ENTRY_POINT_QUESTIONS.filter(
        (q) => q.phase === "PHASE_CEREMONY"
      );
      expect(ceremonyQuestions.length).toBeGreaterThan(0);
    });

    it("should include celebration phase questions", () => {
      const celebrationQuestions = AVAILABLE_ENTRY_POINT_QUESTIONS.filter(
        (q) => q.phase === "PHASE_CELEBRATION"
      );
      expect(celebrationQuestions.length).toBeGreaterThan(0);
    });

    it("should have ceremony_venue_booked question", () => {
      const question = AVAILABLE_ENTRY_POINT_QUESTIONS.find(
        (q) => q.id === "ceremony_venue_booked"
      );
      expect(question).toBeDefined();
      expect(question?.phase).toBe("PHASE_CEREMONY");
      expect(question?.bookedResponse).toBe("yes");
    });

    it("should have venue_search_started question with different bookedResponse", () => {
      const question = AVAILABLE_ENTRY_POINT_QUESTIONS.find(
        (q) => q.id === "venue_search_started"
      );
      expect(question).toBeDefined();
      expect(question?.phase).toBe("PHASE_CELEBRATION");
      expect(question?.bookedResponse).toBe("already_booked");
    });
  });

  describe("DEFAULT_ENTRY_POINT_QUESTION_IDS", () => {
    it("should contain valid question IDs", () => {
      const validIds = AVAILABLE_ENTRY_POINT_QUESTIONS.map((q) => q.id);
      DEFAULT_ENTRY_POINT_QUESTION_IDS.forEach((id) => {
        expect(validIds).toContain(id);
      });
    });

    it("should include ceremony_venue_booked", () => {
      expect(DEFAULT_ENTRY_POINT_QUESTION_IDS).toContain("ceremony_venue_booked");
    });

    it("should include venue_search_started", () => {
      expect(DEFAULT_ENTRY_POINT_QUESTION_IDS).toContain("venue_search_started");
    });

    it("should include photographer_booked", () => {
      expect(DEFAULT_ENTRY_POINT_QUESTION_IDS).toContain("photographer_booked");
    });
  });

  describe("getQuestionsByIds", () => {
    it("should return questions matching the provided IDs", () => {
      const ids = ["ceremony_venue_booked", "venue_search_started"];
      const result = getQuestionsByIds(ids);

      expect(result).toHaveLength(2);
      expect(result.map((q) => q.id)).toContain("ceremony_venue_booked");
      expect(result.map((q) => q.id)).toContain("venue_search_started");
    });

    it("should return empty array for empty IDs", () => {
      const result = getQuestionsByIds([]);
      expect(result).toHaveLength(0);
    });

    it("should return empty array for non-existent IDs", () => {
      const result = getQuestionsByIds(["non_existent_id"]);
      expect(result).toHaveLength(0);
    });

    it("should filter out non-existent IDs", () => {
      const ids = ["ceremony_venue_booked", "non_existent_id"];
      const result = getQuestionsByIds(ids);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("ceremony_venue_booked");
    });

    it("should return all default questions when using DEFAULT_ENTRY_POINT_QUESTION_IDS", () => {
      const result = getQuestionsByIds(DEFAULT_ENTRY_POINT_QUESTION_IDS);
      expect(result).toHaveLength(DEFAULT_ENTRY_POINT_QUESTION_IDS.length);
    });
  });

  describe("getQuestionById", () => {
    it("should return a question by ID", () => {
      const result = getQuestionById("ceremony_venue_booked");

      expect(result).toBeDefined();
      expect(result?.id).toBe("ceremony_venue_booked");
      expect(result?.label).toBe("Lugar de ceremonia");
      expect(result?.phase).toBe("PHASE_CEREMONY");
    });

    it("should return undefined for non-existent ID", () => {
      const result = getQuestionById("non_existent_id");
      expect(result).toBeUndefined();
    });

    it("should return correct question for each default ID", () => {
      DEFAULT_ENTRY_POINT_QUESTION_IDS.forEach((id) => {
        const result = getQuestionById(id);
        expect(result).toBeDefined();
        expect(result?.id).toBe(id);
      });
    });

    it("should return photographer_booked with correct properties", () => {
      const result = getQuestionById("photographer_booked");

      expect(result).toBeDefined();
      expect(result?.label).toBe("Fotografo");
      expect(result?.phase).toBe("PHASE_CELEBRATION");
      expect(result?.bookedResponse).toBe("yes");
    });
  });
});
