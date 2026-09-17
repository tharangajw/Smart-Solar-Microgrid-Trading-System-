package sliit.ead.smartsolarmicrogrid.modules.history;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.RecyclerView;
import sliit.ead.smartsolarmicrogrid.R;

public class BookingHistoryActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_history);

        RecyclerView recyclerView = findViewById(R.id.recyclerViewBookings);
    }
}
