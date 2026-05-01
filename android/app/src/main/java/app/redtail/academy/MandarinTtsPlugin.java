package app.redtail.academy;

import android.speech.tts.TextToSpeech;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Locale;

@CapacitorPlugin(name = "MandarinTts")
public class MandarinTtsPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech textToSpeech;
    private boolean ready = false;

    @Override
    public void load() {
        textToSpeech = new TextToSpeech(getContext(), this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && textToSpeech != null) {
            int languageStatus = textToSpeech.setLanguage(Locale.SIMPLIFIED_CHINESE);
            ready = languageStatus != TextToSpeech.LANG_MISSING_DATA && languageStatus != TextToSpeech.LANG_NOT_SUPPORTED;
        }
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        float rate = call.getFloat("rate", 0.78f);

        if (text == null || text.trim().isEmpty()) {
            call.reject("Text is empty");
            return;
        }

        if (textToSpeech == null) {
            textToSpeech = new TextToSpeech(getContext(), this);
        }

        if (!ready) {
            call.reject("Mandarin TTS is not ready or not installed");
            return;
        }

        textToSpeech.setLanguage(Locale.SIMPLIFIED_CHINESE);
        textToSpeech.setSpeechRate(rate);
        textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "redtail-" + System.currentTimeMillis());

        JSObject response = new JSObject();
        response.put("spoken", true);
        call.resolve(response);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (textToSpeech != null) {
            textToSpeech.stop();
        }
        call.resolve();
    }

    @Override
    protected void handleOnDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        super.handleOnDestroy();
    }
}
