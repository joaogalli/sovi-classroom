package br.com.sovi.classroom.controller.bean;

import java.util.ArrayList;
import java.util.List;

import org.bson.Document;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
public class BulkFindByIdResponse {

	private List<Entry> entries = new ArrayList<BulkFindByIdResponse.Entry>();

	public BulkFindByIdResponse() {
	}

	public void add(String collection, String id, Document document) {
		Entry entry = findEntryByCollection(collection);

		if (entry == null) {
			entry = new Entry(collection);
			entries.add(entry);
		}

		entry.getDocumentEntries().add(new DocumentEntry(id, document));
	}

	public Entry findEntryByCollection(String collection) {
		for (Entry entry : entries) {
			if (collection.equals(entry.getCollection())) {
				return entry;
			}
		}
		return null;
	}

	private class Entry {
		private String collection;

		private List<DocumentEntry> documentEntries = new ArrayList<BulkFindByIdResponse.DocumentEntry>();

		public Entry() {
		}

		public Entry(String collection) {
			this.collection = collection;
		}

		public String getCollection() {
			return collection;
		}

		public void setCollection(String collection) {
			this.collection = collection;
		}

		public List<DocumentEntry> getDocumentEntries() {
			return documentEntries;
		}

		public void setDocumentEntries(List<DocumentEntry> documentEntries) {
			this.documentEntries = documentEntries;
		}
	}

	private class DocumentEntry {
		private String id;

		private Document document;

		public DocumentEntry() {
		}

		public DocumentEntry(String id, Document document) {
			super();
			this.id = id;
			this.document = document;
		}

		public String getId() {
			return id;
		}

		public void setId(String id) {
			this.id = id;
		}

		public Document getDocument() {
			return document;
		}

		public void setDocument(Document document) {
			this.document = document;
		}

	}

}
