package rs.beolib.beolibbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String message;
    private ResponseData<T> data;
    private int status;

    public static <T> ApiResponse<T> ok(String message, List<T> values) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setStatus(200);
        r.setMessage(message);
        ResponseData<T> d = new ResponseData<>();
        d.setValues(values);
        r.setData(d);
        return r;
    }

    public static <T> ApiResponse<T> ok(String message, T value) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setStatus(200);
        r.setMessage(message);
        ResponseData<T> d = new ResponseData<>();
        d.setValue(value);
        r.setData(d);
        return r;
    }

    public static <T> ApiResponse<T> of(int status, String message, List<T> values) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setStatus(status);
        r.setMessage(message);
        ResponseData<T> d = new ResponseData<>();
        d.setValues(values);
        r.setData(d);
        return r;
    }

    public static <T> ApiResponse<T> of(int status, String message, T value) {
        ApiResponse<T> r = new ApiResponse<>();
        r.setStatus(status);
        r.setMessage(message);
        ResponseData<T> d = new ResponseData<>();
        d.setValue(value);
        r.setData(d);
        return r;
    }
}
