package br.com.sovi.classroom.controller.bean;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
public class BulkFindByIdRequest {

	private List<Entry> entries = new ArrayList<Entry>();

	public BulkFindByIdRequest() {
	}
	
	public List<Entry> getEntries() {
		return entries;
	}

	public void setEntries(List<Entry> entries) {
		this.entries = entries;
	}

	public static class Entry {

		private String id, collection;

		public String getId() {
			return id;
		}

		public void setId(String id) {
			this.id = id;
		}

		public String getCollection() {
			return collection;
		}

		public void setCollection(String collection) {
			this.collection = collection;
		}

	}

}
