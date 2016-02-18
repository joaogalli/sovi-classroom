package br.com.sovi.classroom.util;

import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @since 0.0.1
 * 
 */
@Component
public abstract class JsonUtils {

	private static Gson GSON;

	static {
		GSON = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
				.excludeFieldsWithModifiers(Modifier.STATIC, Modifier.TRANSIENT, Modifier.VOLATILE).create();
	}

	public static void setGSON(Gson GSON) {
		JsonUtils.GSON = GSON;
	}

	public static String toJson(Object object) {
		return GSON.toJson(object);
	}

	public static <T> T fromJson(String content, Class<T> class1) {
		return GSON.fromJson(content, class1);
	}

	public static <T> List<T> fromJsonToList(String content, Class<T[]> class1) {
		T[] arr = GSON.fromJson(content, class1);
		return Arrays.asList(arr);
	}

}
